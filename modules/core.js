//Login module
var fs = require('fs'),
    config = JSON.parse(fs.readFileSync('config.json').toString());

exports.types = ["login-request"];

//Logged in users
var userMap = exports.userMap = {};

//Authenticated session checker
exports.auth = function(sessionId) {
  if(userMap[sessionId]) {
    return true;
  } else {
    return false;
  }
};

//Login sequence
exports.init = function(data, client, modules) {
  modules.pop();
  
  //There is no such user
  if(!config.users[data.username]) {
    client.send({ type: "login-fail", msg: "Kasutajat ei eksisteeri!" });    
    return; 
  }
  
  //Wrong or missing password
  if(!data.hash && data.hash != config.users[data.username]) {
    client.send({ type: "login-fail", msg: "Vale parool!" });
    return;
  }

  for (var sessId in userMap) {
    if (userMap.hasOwnProperty(sessId) && userMap[sessId] == data.username) {
      client.send({ type: "login-fail", msg: "Juba sisselogitud!" }); 
      return;
    }
  }
  

  userMap[client.sessionId] = data.username;
  client.send({ 
    type: "login-success", 
    level: 0, //TODO: Different user levels
    "modules" : modules
  });
  
  client.listener.broadcast({
    type: "chat-new",
    username : data.username
  });
};

//Disconnection
exports.disconnected = function(client) {
  client.listener.broadcast({
    type : "chat-leave",
    username : userMap[client.sessionId]
  });
  delete userMap[client.sessionId];
};
