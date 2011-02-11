#!/bin/env node
var connect = require('connect'),
    io = require('socket.io');

var server = connect.createServer(
    connect.logger(),
    connect.staticProvider(__dirname + '/public')
);

server.listen(3000);

var socket = io.listen(server); 
socket.on('connection', function(client){

  client.on('message', function(data){
  socket.broadcast(data);
  }); 
}); 
