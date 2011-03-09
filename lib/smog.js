/**
 * Smog Core
 * @description Contains primary server logic
 */

var fs = require('fs'),
    crypto = require('crypto'),
    util = require('util'),
    io = require('socket.io'),
    modList = require(__dirname + '/../modules'),
    config = JSON.parse(fs.readFileSync(__dirname + '/../config.json').toString());

var Smog = function(server) {
  var that = this;
  this.userMap = {};
  this.msgBuffer = [];

  this.listen(server);
  util.log("Smog ready!");
};

util.inherits(Smog, require('events').EventEmitter);


Smog.prototype.listen = function(server) {
  var socket = io.listen(server),
      that = this;

  //Switch broadcast with announce
  socket.announce = socket.broadcast;
  socket.broadcast = function(/*obj, [except] */) {
    var users = Object.keys(that.userMap);
    for(var i = 0; i < users.length; i++) {
      if(arguments[1] != users[i]) {
        socket.clients[users[i]].send(arguments[0]);
      }
    }
  };

  socket.on('connection', function(client){
    that.emit("sConnect", client);
    client.on('message', function(data){
      that.handle(client, data);
      that.emit("sRequest", client, data);
    });

    client.on('disconnect', function() {
      that.disconnect(client);
      that.emit("sDisconnect", client);
    });
  });
};

/**
 *
 */
Smog.prototype.auth = function(sessionId) {
  if(this.userMap[sessionId]) {
    return true;
  } else {
    return false;
  }
};

Smog.prototype.pushBuffer = function(data) {
  this.msgBuffer.push(data);
  if(this.msgBuffer.length >= 50) {
    this.msgBuffer.shift();
  }
};



/**
 * Process requests
 */
Smog.prototype.handle = function(client, data) {

  var mods = modList.module
  modMap = modList.moduleMap;

  if(data == "" || !data.type) { client.send({ type: "invalid" }); return; }
  var moduleName = modMap[data.type];

  //Privileged access
  if(this.auth(client.sessionId)) {
    //Chat is primary
    if(data.type == "chat") {
      var chatMsg = {
        type: "chat",
        username: this.userMap[client.sessionId],
        msg: data.msg
      };
      client.listener.broadcast(chatMsg);
      util.log(chatMsg.username + ": " + chatMsg.msg);
      this.pushBuffer(chatMsg);
    } else {
      mods[moduleName].init.call(client, data);
    }

  //Otherwise only login is accessible
  } else if(data.type == "login-request") {
    this.connect(client, data);
  } else if(data.type == "logout-request") {
    this.disconnect(client);
  }
};


/**
 * Login sequence
 */
Smog.prototype.connect = function(client, data) {

  //There is no such user
  if(!config.users[data.username]) {
    util.log("Missing user: " + data.username);
    client.send({ type: "login-fail", msg: "User does not exist!" });
    return;
  }

  //Wrong or missing password
  if(!data.hash) {
    var h = crypto.createHash('sha256').update(data.hash).digest('hex');
    if(h != config.users[data.username]) {
      util.log("Login failed as" + data.username);
      client.send({ type: "login-fail", msg: "Wrong password!" });
      return;
    }
  }

  //Check for logged in users
  for (var sessId in this.userMap) {
    if (this.userMap.hasOwnProperty(sessId) && this.userMap[sessId] == data.username) {
      client.send({ type: "login-fail", msg: "Already in!" });
      return;
    }
  }

  this.userMap[client.sessionId] = data.username;
  client.send({
    type: "login-success",
    privileged: config.users[data.username].privileged,
    "modules" : modList.clientModules,
    users: this.userMap
  });

  client.broadcast({
    type: "chat-new",
    username : data.username,
    sessId : client.sessionId
  });

  util.log(data.username + " joined");

  //Send buffer
  //TODO: Send as block?
  for(var i = 0; i < this.msgBuffer.length; i++) {
    client.send(this.msgBuffer[i]);
  }
};



/**
 * TODO: DOC
 */
Smog.prototype.disconnect = function(client) {
  if(this.auth(client.sessionId)) {
    client.listener.broadcast({
      type : "chat-leave",
      username : this.userMap[client.sessionId]
    });
    util.log(this.userMap[client.sessionId] + " left");
    delete this.userMap[client.sessionId];
  }
};



if(!global.Smog) {
  exports.listen = function(server) {
    return new Smog(server);
  }
} else {
  module.exports = global.Smog;
}