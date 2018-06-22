const express = require("express");
const app = express();
const restRouter = require("./routes/rest");
const mongoose = require("mongoose");
const path = require("path");

var http = require('http');
var socketIO = require('socket.io');
var io = socketIO();
var editorSocketService = require('./services/editorSocketService')(io);

const server = http.createServer(app);

io.attach(server);

mongoose.connect("mongodb://bmlylyt:lytzcml799@ds151530.mlab.com:51530/cs503");

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/v1', restRouter);

app.use((req, res) => {
    res.sendFile('index.html', { root : path.join(__dirname, '../public')});
});


server.listen(3000);
server.on('listening', function(){
    console.log("Server starts listening on port 3000");
});