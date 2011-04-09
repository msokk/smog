var connect = require('connect'),
    Smog = require(__dirname + '/lib/smog'),
    port = exports.port = process.env.PORT || 3000;

//Static server
var server = connect.createServer(
    //connect.logger(),
    connect.favicon(),
    connect.static(__dirname + '/public')
);
server.listen(port);

Smog.listen(server);
