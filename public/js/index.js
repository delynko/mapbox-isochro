let socket = io();

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVseW5rbyIsImEiOiJjaXBwZ3hkeTUwM3VuZmxuY2Z5MmFqdnU2In0.ac8kWI1ValjdZBhlpMln3w';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/delynko/cjh10hlxk045o2rn0vzayaxq9',
    center: [-105.20832678312672,39.72951616726479],
    zoom: 13
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

map.on('click', (c) => {
    console.log(c);
})

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
    map.addSource('polygons', {
        'type': 'geojson',
        'data': JSON.parse(polys),
    });

    map.addLayer({
        'id': '10-minute',
        'type': 'fill',
        'source': 'polygons',
        'paint': {
            'fill-color': JSON.parse(polys).features[0].properties.fillColor,
            'fill-opacity': .3
        },
        'filter': ['==', 'contour', 10]
    });

    map.addLayer({
        'id': '5-minute',
        'type': 'fill',
        'source': 'polygons',
        'paint': {
            'fill-color': JSON.parse(polys).features[1].properties.fillColor,
            'fill-opacity': .3
        },
        'filter': ['==', 'contour', 5]
    });

    const coordinates = JSON.parse(polys).features[0].geometry.coordinates[0];

    const bounds = coordinates.reduce(function(bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
        padding: 20
    });
});

socket.on('access-in-poly', (point) => {
    console.log(point);
    let fType;
    switch(point.properties.Feature_Ty){
        case 'Parking Lot':
            fType = 'parking-lot'
            break;
        case 'Access Point':
            fType = 'trailhead'
            break;
        case 'Trailhead':
            fType = 'trailhead'
            break;
    }
    
    let iconFType = document.createElement('div');
    iconFType.className = fType + '-icon';
    new mapboxgl.Marker(iconFType)
        .setLngLat({lng: point.geometry.coordinates[0], lat: point.geometry.coordinates[1]})
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>${point.properties.Park_Name}</p>`))
        .addTo(map);
    
    $('#info-container').append(
        `<div className="access">${point.properties.Park_Name}</div>`
    );
})