#!/usr/bin/env node
var connect = require('connect');

var server = connect.createServer(
    connect.logger(),
    connect.staticProvider(__dirname + '/public')
);

server.listen(3000);