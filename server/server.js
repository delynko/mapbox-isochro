require('dotenv').config();
const express = require('express');
const MapboxClient = require('mapbox');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const hbs = require('hbs');

const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

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

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log(`here we go on ${port}`)
});