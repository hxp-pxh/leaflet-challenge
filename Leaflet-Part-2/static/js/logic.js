// Initialize the map
var myMap = L.map("map", {
  center: [37.09, -95.71], // Adjust the center as needed
  zoom: 5
});

// Add Mapbox tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaHhwcmluY2l2aWwiLCJhIjoiY2xwcGxkNW1xMDF0eDJpbXo3YTBnbWp0cyJ9.eQkMdFert-in9BCcnzK_xw', {
  maxZoom: 18,
  id: 'mapbox/streets-v11', // Choose the style that fits your map
  tileSize: 512,
  zoomOffset: -1
}).addTo(myMap);

// Earthquake layer
var earthquakes = new L.LayerGroup();

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 3;
}

// Function to determine marker color based on earthquake depth
function markerColor(depth) {
  if (depth > 90) return '#ff0000'; // Red
  else if (depth > 70) return '#ff4500'; // OrangeRed
  else if (depth > 50) return '#ff8c00'; // DarkOrange
  else if (depth > 30) return '#ffd700'; // Yellow
  else if (depth > 10) return '#9acd32'; // YellowGreen
  else return '#00ff00'; // Green
}

// Fetch the earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function(data) {
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      var geojsonMarkerOptions = {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "<br>Depth: " + feature.geometry.coordinates[2] + " km");
    }
  }).addTo(earthquakes);
});

earthquakes.addTo(myMap);

// Tectonic plates layer
var tectonicPlates = new L.LayerGroup();

// Fetch the tectonic plates data
var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"; 

d3.json(tectonicPlatesUrl).then(function(plateData) {
  L.geoJSON(plateData, {
    color: "orange",
    weight: 2
  }).addTo(tectonicPlates);
});

tectonicPlates.addTo(myMap);

// Add legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [-10, 10, 30, 50, 70, 90],
      labels = [];

  div.style.backgroundColor = '#fff';
  div.style.padding = '10px';
  div.style.margin = '5px';
  div.style.borderRadius = '5px';
  div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)';

  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + markerColor(grades[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+');
    div.innerHTML += '<br>';
  }

  return div;
};

legend.addTo(myMap);

// Layer control
var baseMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

L.control.layers(baseMaps, null, {
  collapsed: false
}).addTo(myMap);
