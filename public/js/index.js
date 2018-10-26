let socket = io();

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/delynko/cjh10hlxk045o2rn0vzayaxq9'
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

map.on('load', () => {
    const draw = new MapboxDraw({
        controls: {
            line_string: false,
            polygon: false,
            trash: false,
            combine_features: false,
            uncombine_features: false
        }
    });
    map.addControl(draw, 'top-left');

    map.on('draw.create', (e) => {
        let coords = `${e.features[0].geometry.coordinates[0]},${e.features[0].geometry.coordinates[1]}`;
        let walkOrigin = document.createElement('div');
        walkOrigin.className = 'walk-origin';
        new mapboxgl.Marker(walkOrigin)
            .setLngLat({lng: e.features[0].geometry.coordinates[0], lat: e.features[0].geometry.coordinates[1]})
            .addTo(map);
        socket.emit('map-coordinates', coords);
    });
})

socket.on('isochrone-polys', (polys) => {
    console.log(JSON.parse(polys));
    map.addSource('polygons', {
        'type': 'geojson',
        'data': JSON.parse(polys),
    });

    map.addLayer({
        'id': '20-minute',
        'type': 'fill',
        'source': 'polygons',
        'paint': {
            'fill-color': JSON.parse(polys).features[0].properties.fillColor,
            'fill-opacity': .6
        },
        'filter': ['==', 'contour', 20]
    });

    map.addLayer({
        'id': '15-minute',
        'type': 'fill',
        'source': 'polygons',
        'paint': {
            'fill-color': JSON.parse(polys).features[1].properties.fillColor,
            'fill-opacity': .6
        },
        'filter': ['==', 'contour', 15]
    });

    map.addLayer({
        'id': '10-minute',
        'type': 'fill',
        'source': 'polygons',
        'paint': {
            'fill-color': JSON.parse(polys).features[2].properties.fillColor,
            'fill-opacity': .6
        },
        'filter': ['==', 'contour', 10]
    });

    const coordinates = JSON.parse(polys).features[0].geometry.coordinates[0];
    console.log(coordinates);

    const bounds = coordinates.reduce(function(bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
        padding: 20
    });
});

socket.on('access-in-poly', (points) => {
    console.log(points)
})