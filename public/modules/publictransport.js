(function() {
  Smog.filter("transport", function(str) {
    if(str.indexOf("!troll") == 0) {
      var parts = str.split(" ");
      this.socket.send({
        type: "pubtransport-request"
      });
    } else {
      return str;
    }
  });
  
  Smog.on("pubtransport-response", function(data) {
    Smog.UI.displayInfoMsg("Transport: Järgmine troll läheb Keemiast " + data.msg);
  });
  
})();
