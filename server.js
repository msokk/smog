#!/usr/bin/env node

var connect = require('connect'),
    fs      = require('fs'),
    util    = require('util'),
    io      = require('socket.io')
    core = require(__dirname + '/lib/core');

//Static server
var server = connect.createServer(
    //connect.logger(),
    connect.static(__dirname + '/public')
);

var port = process.env.PORT || 3000;

server.listen(port);

//Socket server
var socket = io.listen(server);

//Switch broadcast with announce
socket.announce = socket.broadcast;
socket.broadcast = function(/*obj, [except] */) {
  var users = Object.keys(core.userMap);
  for(var i = 0; i < users.length; i++) {
    if(arguments[1] != users[i]) {
      socket.clients[users[i]].send(arguments[0]);
    }
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

if(!process.env.PORT) {
  var url = "http://127.0.0.1:" + port;
  util.log("Smog ready! - Trying to start your browser in: " + url);

  require("child_process").exec("x-www-browser " + url);
} else {
  util.log("Smog ready!");
}
