//timeline --
//each age group has own color
//location different opacity 
//??add legend for age colors and Opacity?
//legend select 



function getAgeColor(age, place_to) {

  if (age <= 18) {  // Red for school ages
      if (place_to === "AtHome") {
          return [227, 3, 28, 255];
      } else if (place_to === "AtSchool") {
          return [227, 3, 28, 200];
      } else if (place_to === "AtWork") {
          return [227, 3, 28, 125];
      } else if (place_to === "AtRecreation") {
          return [227, 3, 28, 50];
      } else {
          return [227, 3, 28, 25];
      }
  } else if ( age <= 29) {// Orange for young adult ages
      if (place_to === "AtHome") {
            return [254, 143, 4, 255];
      } else if (place_to === "AtSchool") {
          return [254, 143, 4, 200];
      } else if (place_to === "AtWork") {
          return [254, 143, 4, 125];
      } else if (place_to === "AtRecreation") {
          return [254, 143, 4, 50];
      } else {
          return [254, 143, 4, 25];
      }
  } else if ( age <= 65) { // purple for adult ages
      if (place_to === "AtHome") {
          return [20, 43, 184, 255];
      } else if (place_to === "AtSchool") {
          return [20, 43, 184, 200];
      } else if (place_to === "AtWork") {
          return [20, 43, 184, 125];
      } else if (place_to === "AtRecreation") {
          return [20, 43, 184, 50];
      } else {
          return [20, 43, 184, 25];
      }
    }
}


//trip layer data type
//google deck gl trip layer 
//javascript template not 


const { Deck } = deck;

mapboxgl.accessToken =
  "pk.eyJ1IjoiZHBmb3NlciIsImEiOiJjazlxaHRvbmMwazR2M2Vwbmpha3I5c28yIn0.nklv92j_cl0t2HsHD579AQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  center: [-122.44, 37.75],
  zoom: 13,
  pitch: 45
});

const slider = document.getElementById("time-slider");
const label = document.getElementById("time-label");
const playBtn = document.getElementById("play-btn");

let currentTime = 0;
let isPlaying = true;
let loopLength = 0;
const animationSpeed = 4;

const deckOverlay = new deck.MapboxOverlay({
  layers: []
});

map.addControl(deckOverlay);

// Load your custom data
fetch(
  "https://dl.dropboxusercontent.com/scl/fi/r8a4wdxydbhlwczic26f5/trips_sf_5k-1.json?rlkey=ean1h1vhwgppfn4jwu02famuo&st=ebif1sjs&dl=0"
) 
  .then((res) => res.json())
  .then((data) => {
    const allTimestamps = data.flatMap((d) => d.timestamps);
    const minTimestamp = allTimestamps.reduce(
      (min, t) => (t < min ? t : min),
      Infinity
    );
    const maxTimestamp = allTimestamps.reduce(
      (max, t) => (t > max ? t : max),
      -Infinity
    );
    loopLength = maxTimestamp - minTimestamp;
    slider.max = loopLength;

    const tripsData = data.map((agent) => ({
      path: agent.path.map((coords) => [...coords, 0]),
      timestamps: agent.timestamps.map((t) => t - minTimestamp),
      age: agent.age,
      path_on: agent.path_on,
      color: getAgeColor(agent.age, agent.place_to),
    }));

    const tripsLayer = (time) =>
      new deck.TripsLayer({
        id: "trips-layer",
        data: tripsData,
        getPath: (d) => d.path,
        getTimestamps: (d) => d.timestamps,
        currentTime: time,
        trailLength: 50,
        capRounded: true,
        jointRounded: true,
        widthMinPixels: 3,
        getColor: (d) => d.color
      });

    const updateVis = (time) => {
      slider.value = time;
      const totalMinutes = Math.floor(time / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      label.textContent = `${hours}:${minutes.toString().padStart(2, "0")}`;

      deckOverlay.setProps({ layers: [tripsLayer(time)] });
    };

    const animate = () => {
      if (isPlaying) {
        currentTime = (currentTime + animationSpeed) % loopLength;
        updateVis(currentTime);
      }
      requestAnimationFrame(animate);
    };

    slider.addEventListener("input", (e) => {
      currentTime = parseInt(e.target.value, 10);
      updateVis(currentTime);
    });

    playBtn.onclick = () => {
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? "Pause" : "Play";
    };

    animate();
  })
  .catch((error) => console.error("Error loading data:", error));