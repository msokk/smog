#!/usr/bin/env node

var connect = require('connect'),
    fs = require('fs'),
    io = require('socket.io')
    modules = require('./modules'),
    core = require('./modules/core.js');

//Static server
var server = connect.createServer(
    //connect.logger(),
    connect.gzip(),
    connect.staticProvider(__dirname + '/public')
);
server.listen(3000);


var clients = {},
    auth = core.auth,
    userMap = core.userMap;
  

var socket = io.listen(server); 

//Augment broadcast for our needs
socket.broadcast = function(obj) {
  var users = Object.keys(userMap);
  for(var i = 0; i < users.length; i++) {
    socket.clients[users[i]].send(obj);
  }
};

socket.on('connection', function(client){

  client.on('message', function(data){
    if(data == "" || !data.type) { client.send({ type: "invalid" }); return; }
    var moduleName = modules._moduleMap[data.type];
    
    //Privileged access
    if(auth(client.sessionId)) {
      if(data.type == "chat") {
        socket.broadcast({ 
          type: "chat", 
          username: userMap[client.sessionId],
          msg: data.msg
        });
      } else {
        modules[moduleName].init.call(null, data, client);
      }
    //Otherwise only login is accessible 
    } else if(data.type == "login-request") {
      core.init.call(null, data, client, Object.keys(modules));
    }
  });
  
  client.on('disconnect', function() {
    if(auth(client.sessionId)) {
      core.disconnected(this);
    }
  });
}); 
