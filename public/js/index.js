let socket = io();

// mapbox streets tile layer
const mapboxStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w'
});

// create map
const map = L.map("map", {
    maxZoom: 18,
    layers: [mapboxStreets],
    home: true
}).setView([39.731910915528054, -105.2068591117859], 13);


map.on('click', (e) => {
    coords = `${e.latlng.lng},${e.latlng.lat}`;
    socket.emit('map-coordinates', coords);
});

socket.on('isochrone-polys', (polys) => {
    console.log(JSON.parse(polys));
});