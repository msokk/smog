<<<<<<< HEAD
﻿#!/bin/env node
=======
>>>>>>> 63ced642e869b23584c2fa0880f9f5b9db2677c1
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
