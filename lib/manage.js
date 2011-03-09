var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),

    configPath = __dirname + "/../config.json",
    configFile = fs.readFileSync(configPath).toString(),
    config = (configFile)? JSON.parse(configFile): {
      motd : {},
      users : {},
      version : "latest"
    };

var Manage = module.exports = {
  config: config,

  addUser: function(user, password, admin) {
    var hashed = crypto.createHash('sha256')
                    .update(password).digest('hex');
    config.users[user] = {
      hash: hashed,
      privileged: (admin)? true: false
    };
    this.writeConfig();
  },

  delUser: function(user) {
    delete config.users[user];
    this.writeConfig();
  },

  setAdmin: function(privilege, user) {
    config.users[user].privileged = privilege;
    this.writeConfig();
  },

  setMotd: function(motd) {
    config.motd = motd;
    this.writeConfig();
  },

  writeConfig: function() {
    fs.writeFileSync(configPath, JSON.stringify(config));
  }
}