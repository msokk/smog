var os = require('os');

exports.types = ["serverinfo"];

var sysinfo = function() {
  return {
    hostname: os.hostname(),
    os: os.type() + " " + os.release(),
    uptime: Math.round(os.uptime()/3600) + "h",
    loadavg: os.loadavg(),
    memory: ((!os.freemem())? "": (Math.round(os.freemem()/1048576) + " MB / "))
      + Math.round(os.totalmem()/1048576) + " MB",
    cpu: (os.cpus())? os.cpus()[0].model + " - " + os.cpus().length + " cores": "N/A"
  };
};

exports.init = function(data) {
  this.send({
    type: "serverinfo",
    sysinfo: sysinfo()
  });
};