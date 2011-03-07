var os = require('os');

exports.types = ["serverinfo"];

var sysinfo = function() {
  return {
    hostname: os.hostname(),
    os: os.type() + " " + os.release(),
    uptime: Math.round(os.uptime()/3600) + "h",
    loadavg: os.loadavg(),
    memory: ((!os.freemem())? "": (os.freemem() + " MB / ")) + Math.round(os.totalmem()/1048576) + " MB",
    cpu: os.cpus()[0].model + " - " + os.cpus().length + " cores"
  };
};

exports.init = function(data) {
  this.send({
    type: "serverinfo",
    sysinfo: sysinfo()
  });
};