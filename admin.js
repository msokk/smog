#!/usr/bin/env node
require('colors');

var fs = require('fs'),
    path = require('path'),
    sys = require('sys'),
    crypto = require('crypto'),
    configPath = __dirname + "/config.json",
    config = JSON.parse(fs.readFileSync(configPath).toString()) || {
      motd : {},
      users : {},
      version : "v0.4.1"
    };

var AdminTool = {
  displayHelp : function() {
    console.log("\n  Smog Admin tool\n".cyan.bold);
    console.log("Available commands:".blue);
    console.log("  "+"setup".underline);
    console.log("  "+"show".underline);
    console.log("  "+"adduser".underline+" [name]".white);
    console.log("  "+"deleteuser".underline+" [name]".white);
    console.log("  "+"setmotd".underline+" [motd]".white);
  },

  setup : function() {
    var serverPath = "/usr/local/bin/smog";
    path.exists(serverPath, function(exists) {
      if(!exists) {
        fs.symlinkSync(__dirname + "/server.js", serverPath);
      }
    });
  },

  showConfig : function() {
    console.dir(config);
  },

  addUser : function(user) {
    console.log("Password:".white);
    var stdin = process.openStdin(),
        stdio = process.binding("stdio"),
        that  = this;
    stdio.setRawMode();

    var password = "";
    stdin.on("data", function (c) {
      c = c + "";
      switch (c) {
        case "\n": case "\r": case "\u0004":
          stdio.setRawMode(false);
          var h = crypto.createHash('sha256');
          h.update(password);
          var first = h.digest('hex');
          var h = crypto.createHash('sha256');
          h.update(first);
          config.users[user] = h.digest('hex');
          that.writeConfig();
          stdin.pause();
          break
        case "\u0003":
          process.exit();
          break;
        default:
          password += c;
          break;
      }
    });
  },

  delUser : function(user) {
    delete config.users[user];
    this.writeConfig();
  },

  setMotd : function(motd) {
    config.motd = motd;
    this.writeConfig();
  },

  writeConfig : function() {
    fs.writeFileSync(configPath, JSON.stringify(config));
  }
}

if(process.argv[1].indexOf("admin.js") != -1) {
  if(process.argv[2]) {
    switch(process.argv[2]) {
      case "adduser": AdminTool.addUser(process.argv[3]);
        break;
      case "deleteuser": AdminTool.delUser(process.argv[3]);
        break;
      case "setmotd": AdminTool.setMotd(process.argv[3]);
        break;
      case "show": AdminTool.showConfig();
        break;
      case "setup": AdminTool.setup();
        break;
    }
  } else {
    AdminTool.displayHelp();
  }
}
