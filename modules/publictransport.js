var http = require('http'),
    querystring = require('querystring'),
    xml2js = require('xml2js');
    
var parser = new xml2js.Parser(),
    d = new Date();

var PubTransport = (function() {
  
  var requestXml = function(params, callback) {
    var buffer = "";
    var query = "/?" + querystring.stringify(params) + "&" + 
      querystring.stringify({ t: "xml" });
    var req = http.request({
      host: "soiduplaan.tallinn.ee",
      port: 80,
      path: query,
      headers : {
        "User-Agent": "Mozilla/5.0 (X11; U; Linux x86_64; en-US)"+
        " AppleWebKit/534.13 (KHTML, like Gecko) Chrome/9.0.597.98 Safari/534.13"
      }
    }, function(res) {
      res.setEncoding("utf8");
      
      res.on('data', function(chunk) {
        buffer += chunk;
      });
      
      res.on('end', function(chunk) {
        parser.addListener('end', function(result) {
          parser.removeAllListeners('end');
          callback(result);
        });
        parser.parseString(buffer);
      });
    });
    
    req.end();
  },
  
  checkTime = function(callback) {
    var direction_id = "22465",
      stop_id = "881";
      
    requestXml({
      a: "p.schedule",
      "direction_id": direction_id,
      "stop_id": stop_id
    }, function(xml) {
      var hours = xml.days.day[0].hour;
      for(var i = 0; i < hours.length; i++) {
        if(hours[i]['@'].hr == d.getHours()) {
          var minutes = hours[i].minutes;
          for(var u = 0; u < minutes.length; u++) {
            if(d.getMinutes() < minutes[u]["#"]) {
              callback(hours[i]['@'].hr + ":" + minutes[u]["#"]);
              break;
            }
          }
        }
      }
    });
    
  };
  
  return {
    checkTime : checkTime
  }
  
})();


exports.types = ["pubtransport-request"];

exports.init = function(data) {
  var that = this;
  PubTransport.checkTime(function(time) {
    that.send({
      type: "pubtransport-response",
      msg: time
    });
  });
};