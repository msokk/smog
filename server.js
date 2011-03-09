#!/usr/bin/env node

var connect = require('connect'),
    util    = require('util'),
    Smog = require(__dirname + '/lib/smog'),
    port = process.env.PORT || 3000;

//Static server
var server = connect.createServer(
    //connect.logger(),
    connect.favicon(),
    connect.static(__dirname + '/public')
);
server.listen(port);

Smog.listen(server);


if(!process.env.PORT) {
  var url = "http://127.0.0.1:" + port;
  util.log("Trying to start your browser in: " + url + "\n");
  require("child_process").exec("x-www-browser " + url);
}