Smog.Core = {
  init: function() {
    var that = this;

    Smog.filter('htmlentities', function(str) {
      return str.replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;');
    });

    Smog.filter("clear", function(str) {
      if(str == "/clear") {
        $("#content").empty();
      } else {
        return str;
      }
    });

    Smog.on("login-success", function(data) {
      //Store username and hash for autologin
      var persistent = Smog.Storage.get("persistent", true) || false;

      if(Smog.Storage.get("username", persistent)) {
        $("#loginPane").remove();
        $("#overlay").remove();
      } else {
        Smog.Storage.set("username", Smog.username, persistent);
        Smog.Storage.set("hash", Smog._hash, persistent);
        delete Smog._hash;

        $("#loginPane").fadeOut(1000, function() { $(this).remove(); });
        $("#overlay").fadeOut(1000, function() { $(this).remove(); });
      }

      Smog.UI.setStatus("#8CFBAD");

      $('#entryBox').focus();

      Smog.UI.displayInfoMsg("Logged in! Modules : " +
        JSON.stringify(data.modules));
      for(var i = 0; i < data.modules.length; i++) {
        Smog.load(data.modules[i]);
      }

      //Populate user list
      for(var key in data.users){
        Smog.UI.addUser(data.users[key], key);
      }

      Smog.UI.setMotd(data.motd);

    });

    Smog.on("login-fail", function(data) {
      Smog.UI.displayInfoMsg(data.msg);
    });

    Smog.on("chat-new", function(data) {
      Smog.UI.addUser(data.username, data.sessId);
      Smog.UI.displayInfoMsg(data.username + " joined!");
    });

    Smog.on("chat-leave", function(data) {
      Smog.UI.deleteUser(data.username);
      Smog.UI.displayInfoMsg(data.username + " left!");
    });

    Smog.on('chat-buffer', function(data) {
      var logStr = "";
      for(var i = 0; i < data.buffer.length; i++) {
        var msg = data.buffer[i];
        logStr += '<li class="message">'+
        '<span class="timestamp"></span>'+
        '<span class="name">'+msg.username+'</span>: '+
        '<span class="msg">'+msg.msg+'</span>'+
        '</li>';
      }
      $('#container ul').append(logStr);
      $("li.message:last")[0].scrollIntoView();
    });

    Smog.on("chat", function(data) {
      Smog.UI.displayChatMsg(data.username, data.msg);
    });
  }
};