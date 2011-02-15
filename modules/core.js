/**
 * Smog Core
 * @description Contains primary server logic
 */

var fs = require('fs'),
    crypto = require('crypto'),
    util = require('util'),
    modules = require('../modules').module,
    moduleMap = require('.').moduleMap,
    clientModules = require('.').clientModules,
    config = JSON.parse(fs.readFileSync('config.json').toString());

var Core = (function() {
  
  var userMap   = {},
      msgBuffer = [],
  
  auth = function(sessionId) {
    if(userMap[sessionId]) {
      return true;
    } else {
      return false;
    }
  },
  
  //Login sequence
  login = function(data) {
    
    //There is no such user
    if(!config.users[data.username]) {
      this.send({ type: "login-fail", msg: "Kasutajat ei eksisteeri!" });
      return;
    }
    
    //Wrong or missing password
    if(!data.hash) {
      var h = crypto.createHash('sha256');
      h.update(data.hash);
      if(h.digest('hex') != config.users[data.username]) {
        util.log("Failed login with" + data.username);
        this.send({ type: "login-fail", msg: "Vale parool!" });
        return;
      }
    }
    
    //Check for logged in users
    for (var sessId in userMap) {
      if (userMap.hasOwnProperty(sessId) && userMap[sessId] == data.username) {
        this.send({ type: "login-fail", msg: "Juba sisselogitud!" });
        return;
      }
    }
    
  
    userMap[this.sessionId] = data.username;
    this.send({
      type: "login-success",
      level: 0, //TODO: Different user levels
      "modules" : clientModules
    });
    
    this.listener.broadcast({
      type: "chat-new",
      username : data.username
    });
    util.log(data.username + " joined");
    
    //Send buffer
    for(var i = 0; i < msgBuffer.length; i++) {
      this.send(msgBuffer[i]);     
    }

  },
  
  //Logout
  disconnected = function(client) {
    if(auth(client.sessionId)) {
      client.listener.broadcast({
        type : "chat-leave",
        username : userMap[client.sessionId]
      });
      util.log(userMap[client.sessionId] + " left");
      delete userMap[client.sessionId];
    }
  },
  
  pushBuffer = function(data) {
    msgBuffer.push(data);
    if(msgBuffer.length >= 50) {
      msgBuffer.shift();
    }
  },
  
  
  //Forward any request
  processRequest = function(client, data) {
    if(data == "" || !data.type) { client.send({ type: "invalid" }); return; }
    var moduleName = moduleMap[data.type];
    
    //Privileged access
    if(auth(client.sessionId)) {
      if(data.type == "chat") {
        var chatMsg = {
          type: "chat",
          username: userMap[client.sessionId],
          msg: data.msg
        };
        client.listener.broadcast(chatMsg);
        util.log(chatMsg.username + ": " + chatMsg.msg);
        pushBuffer(chatMsg);
      } else {
        modules[moduleName].init.call(client, data);
      }
    //Otherwise only login is accessible 
    } else if(data.type == "login-request") {
      login.call(client, data);
    }    
  };
  
  return {
    userMap : userMap,
    handleDisconnect : disconnected,
    handleRequest : processRequest,
    hasSession: auth
  };
  
  
}());

module.exports = Core;