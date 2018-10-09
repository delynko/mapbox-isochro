let socket = io();

// mapbox streets tile layer
const mapboxStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.dark',
    accessToken: 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w'
});

// create map
const map = L.map("map", {
    maxZoom: 18,
    layers: [mapboxStreets],
    home: true
}).setView([39.731910915528054, -105.2068591117859], 13);

const drawControl = new L.Control.Draw({
    draw: {
        // remove unnecessary buttons
        rectangle: false,
        polyline: false,
        polygon: false,
        circle: false
    },
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
    console.log(e);
    coords = `${e.layer._latlng.lng},${e.layer._latlng.lat}`;
    socket.emit('map-coordinates', coords);
})

socket.on('isochrone-polys', (polys) => {
    L.geoJson(JSON.parse(polys), {
        style: function(feature) {
            c = feature.properties.contour
            return c == 5 ? {color: feature.properties.color, fillOpacity: feature.properties.fillOpacity, opacity: feature.properties.fillOpacity} :
                c == 10 ? {color: feature.properties.color, fillOpacity: feature.properties.fillOpacity, opacity: feature.properties.fillOpacity} :
                {color: feature.properties.color, fillOpacity: feature.properties.fillOpacity, opacity: feature.properties.fillOpacity}
            },
        onEachFeature: function(feature, layer){
            console.log(feature);
        }
    }).addTo(map);
});