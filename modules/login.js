//Login module

exports.types = ["login-request", "veel midagi"];

var Login = function(data, client) {

  if(data.type == "login-request") {
    client.send({msg: "Ah et " + data.data.username + " tahad logida"});
  }
}



exports.init = Login;
