(function() {
  Smog.filter("serverinfo", function(str) {
    if(str.indexOf("/version") != -1) {
      this.socket.send({
        type: "serverinfo"
      });
    } else {
      return str;
    }
  });

  Smog.on("serverinfo", function(data) {
    Smog.UI.displayInfoMsg(
      "Hostname: " + data.sysinfo.hostname + " <br/>" +
      "CPU: " + data.sysinfo.cpu + " <br/>" +
      "Memory: " + data.sysinfo.memory + " <br/>" +
      "OS: " + data.sysinfo.os + " <br/>" +
      "Uptime: " + data.sysinfo.uptime
    );
  });
})();