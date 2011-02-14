/**
 * Smog Core
 * @description Contains primary server logic
 */

var fs = require('fs'),
    crypto = require('crypto'),
    modules = require('../modules').module,
    moduleMap = require('.').moduleMap,
    clientModules = require('.').clientModules,
    config = JSON.parse(fs.readFileSync('config.json').toString());

var Core = (function() {
  
  var userMap   = {},
      msgBuffer = {},
  
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
  },
  
  //Logout
  disconnected = function(client) {
    if(auth(client.sessionId)) {
      client.listener.broadcast({
        type : "chat-leave",
        username : userMap[client.sessionId]
      });
      delete userMap[client.sessionId];
    }
  },
  
  
  //Forward any request
  processRequest = function(client, data) {
    if(data == "" || !data.type) { client.send({ type: "invalid" }); return; }
    var moduleName = moduleMap[data.type];
    
    //Privileged access
    if(auth(client.sessionId)) {
      if(data.type == "chat") {
        client.listener.broadcast({
          type: "chat",
          username: userMap[client.sessionId],
          msg: data.msg
        });
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