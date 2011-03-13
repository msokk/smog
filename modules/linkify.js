exports.types = ["embeddedVideo"];

exports.init = function(data) {
  this.listener.broadcast(data);
};