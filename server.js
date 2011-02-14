#!/usr/bin/env node

var connect = require('connect'),
    fs      = require('fs'),
    io      = require('socket.io')
    core = require('./modules/core');

//Static server
var server = connect.createServer(
    //connect.logger(),
    connect.gzip(),
    connect.staticProvider(__dirname + '/public')
);
server.listen(3000);

//Socket server
var socket = io.listen(server);

//Switch broadcast with announce
socket.announce = socket.broadcast;
socket.broadcast = function(obj) {
  var users = Object.keys(core.userMap);
  for(var i = 0; i < users.length; i++) {
    socket.clients[users[i]].send(obj);
  }
};

socket.on('connection', function(client){
  client.on('message', function(data){
    core.handleRequest(client, data);
  });
  
  client.on('disconnect', function() {
    core.handleDisconnect(client);
  });
});