require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const hbs = require('hbs');
const curl = require('curl');
const mbxDatasets = require('@mapbox/mapbox-sdk/services/datasets');
const datasetsClient = mbxDatasets({ accessToken: `${process.env.MAPBOX_API_KEY}` });
const helpers = require('@turf/helpers');
const inside = require('@turf/inside');

const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

let pointData;
datasetsClient.listFeatures({
    datasetId: 'cjn28htkt03w92wo4air28op3'
    })
    .send()
    .then(response => {
        const features = response.body;
        pointData = features;
});

app.use(express.static(path.join(__dirname, '../public')));

app.set("views", path.resolve(__dirname, "../views"));
app.set("view engine", "hbs");

hbs.registerPartials(path.resolve(__dirname, '../views/partials'));

app.get('/', (req, res) => {
    res.render('index.hbs', {
        jScript: '/js/index.js',
        title: 'Mapbox Isochrone'
    });
})

io.on('connection', (socket) => {
    console.log('connected');

    socket.on('map-coordinates', (coords) => {
        curl.get(`https://api.mapbox.com/isochrone/v1/mapbox/walking/${coords}?contours_minutes=10,15,20&contours_colors=04e813,aaaa00,aa0000&polygons=true&access_token=${process.env.MAPBOX_API_KEY}`, "", (err, res, body) => {
            socket.emit('isochrone-polys', body);
            const polygons = JSON.parse(body);
            const turfPoly = helpers.polygon([polygons.features[0].geometry.coordinates[0]]);
            pointData.features.map((f) => {
                const pwip = inside(f, turfPoly)
                if (pwip == true) {
                    socket.emit('access-in-poly', f);
                }
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log(`here we go on ${port}`)
});