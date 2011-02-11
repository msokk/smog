#!/usr/bin/env node

var connect = require('connect'),
    io = require('socket.io');

//Static server
var server = connect.createServer(
    connect.logger(),
    connect.gzip(),
    connect.staticProvider(__dirname + '/public')
);
server.listen(3000);


var modules = require('./modules'),
    clients = {};


var socket = io.listen(server); 
socket.on('connection', function(client){

  client.on('message', function(data){
    var moduleName = modules.moduleMap[data.type];
    modules[moduleName].init.call(null, data, client);
    
  });
  
  client.on('disconnect', function() {
    console.log(this);
  });
}); 
