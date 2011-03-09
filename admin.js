#!/usr/bin/env node
require('colors');

var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    Manage = require(__dirname + '/lib/manage');

var AdminTool = {
  displayHelp: function() {
    console.log("\n  Smog Admin tool\n".cyan.bold);
    console.log("Available commands:".blue);
    console.log("  "+"setup".underline);
    console.log("  "+"show".underline);
    console.log("  "+"adduser".underline+" [name]".white);
    console.log("  "+"deleteuser".underline+" [name]".white);
    console.log("  "+"setadmin".underline+" [privilege]".white+" [name]".white);
    console.log("  "+"setmotd".underline+" [motd]".white);
  },

  setup: function() {
    var serverPath = "/usr/local/bin/smog";
    path.exists(serverPath, function(exists) {
      if(!exists) {
        fs.symlinkSync(__dirname + "/server.js", serverPath);
      }
    });
  },

  showConfig: function() {
    console.dir(Manage.config);
  },

  addUser: function(user, privilege) {
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
          var hash = crypto.createHash('sha256')
                      .update(password).digest('hex');
          Manage.addUser(user, hash, privilege);
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
  }
}

if(process.argv[2]) {
  switch(process.argv[2]) {
    case "adduser": AdminTool.addUser(process.argv[3], process.argv[4]);
      break;
    case "deleteuser": Manage.delUser(process.argv[3]);
      break;
    case "setadmin": Manage.setAdmin(process.argv[3], process.argv[4]);
      break;
    case "setmotd": Manage.setMotd(process.argv[3]);
      break;
    case "show": AdminTool.showConfig();
      break;
    case "setup": AdminTool.setup();
      break;
  }
} else {
  AdminTool.displayHelp();
}