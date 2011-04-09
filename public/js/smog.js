var Smog = {
  ver: "0.0.1",
  debug: true,
  log: function (msg) {
    if(window.console != undefined && this.debug) {
      console.log(msg);
    }
  }
};

//Fire system on DOM load
$(document).ready(function() {
  Smog.start();
});


(function() {

  //Ensures the new keyword
  Smog.start = function() { return new Smog.Main(); };

  Smog.Main = function() {
    Smog.lang = Smog.Storage.get("lang", true) || "en";

    var that = this,
    socket = this.socket = new io.Socket();
    socket.connect();

    socket.on('connect', function() {
      Smog.UI.setStatus("#FBF78C");
    });

    socket.on('disconnect', function() {
      Smog.UI.setStatus("red");
      setInterval(function() {
        socket.connect();
        if(socket.connected) {
          window.location.href = ""; //Remove refresh in future
        }
      }, 2000);

    });

    socket.on('message', function(data){
      Smog.log(data);
      if(!Smog.UI.hasFocus) {
        Smog.UI.alertTitle();
      }
      that.routes[data.type].call(that, data);
    });

    //Input history
    this.history = [];
    this.historyIndex = -1;

    //Global objects for modules
    this.routes = {};
    this.sendFilters = {};

    //Expose API
    Smog.on = function() { that.on.apply(that, arguments); },
    Smog.die = function() { that.die.apply(that, arguments); },
    Smog.filter = function() {  that.filter.apply(that, arguments); },
    Smog.removeFilter = function() { that.removeFilter.apply(that, arguments); };

    //Core functionality uses same system
    Smog.Core.init.call(this);

    this.bindLogin();
    this.bindLogout();
    this.bindInput();

    $(window).bind('blur', function(e) {
      Smog.UI.hasFocus = false;
    });

    $(window).bind('focus', function(e) {
      Smog.UI.hasFocus = true;
      Smog.UI.clearTitle();
    });
  };

  Smog.Main.prototype.on = function(type, callback) {
    if(!this.routes[type]) {
      this.routes[type] = callback;
    } else {
      throw "This type is already defined!";
    }
  };

  Smog.Main.prototype.die = function(type) {
    delete this.routes[type];
  };

  Smog.Main.prototype.filter = function(name, callback) {
    if(!this.sendFilters[name]) {
      this.sendFilters[name] = callback;
    } else {
      throw "Cant overwrite filter : " + name;
    }
  };

  Smog.Main.prototype.removeFilter = function(name) {
    delete this.sendFilter[type];
  };

  Smog.Main.prototype.bindInput = function() {
    var that = this;

    $(document).keydown(function(e) {
      if($(document.activeElement).attr("id") == "entryBox"
         && (e.which == '38' || e.which == '40') && that.history.length != 0) {
        if(e.which == '38') { //Up
          that.historyIndex++;
        }

        if(e.which == '40') { //Down
          that.historyIndex--;
        }
        if(that.historyIndex <= -1) {
          $("#entryBox").val("");
          that.historyIndex = -1;
          return;
        }

        if(that.historyIndex >= that.history.length) {
          that.historyIndex = that.history.length-1;
        }

        $("#entryBox").val(that.history[that.historyIndex]);
        setTimeout(function() {
          $("#entryBox").select();
        }, 1);
      }
    });
    $('#entryBox').keypress(function(e) {
      if (e.which == '13') {
        that.sendMsg();
      }
    });
  };

  Smog.Main.prototype.bindLogin = function() {
    var that = this;
    var persistent = Smog.Storage.get("persistent", true) || false;

    if(!Smog.Storage.get("username", persistent)) {
      var user = "",
          credentials = $('#credentials');
      credentials.focus();

      credentials.keypress(function(event) {
        if (event.which == '13') {

          //Username input
          if(!user) {
            user = credentials.val();
            credentials.val("");
            credentials.clone()
              .attr("type", "password")
              .attr("id", "credentials")
              .insertBefore(credentials)
              .focus();

            credentials.remove();
            $("#infoField").html("Password");
          //Password input and login
          } else {
            var hash = hex_sha256(credentials.val());
            that.socket.send({
              type: "login-request",
              username: user,
              hash: hash
            });
            //Temporarily store hash and username for successful login
            Smog.username = user;
            Smog._hash = hash;
          }
        }
      });

    //sessionStorage has data, login automatically
    } else {
      Smog.username = Smog.Storage.get("username", persistent);
      that.socket.send({
        type: "login-request",
        username: Smog.username,
        hash: Smog.Storage.get("hash", persistent)
      });
    }


    //Bind remember button
    $("#lock").click(function() {
      if($(this).hasClass("persistent")) {
        $(this).toggleClass("persistent");
        Smog.Storage.set("persistent", false, true);
      } else {
        $(this).toggleClass("persistent");
        Smog.Storage.set("persistent", false, true);
      }
    });
  };

  Smog.Main.prototype.sendMsg = function() {
    var msg = $("#entryBox").val(),
        key;


    this.history.unshift(msg);
    if(this.history.length >= 30) {
      this.history.pop();
    }
    this.historyIndex = -1;


    for(key in this.sendFilters) {
      if(this.sendFilters.hasOwnProperty(key) && msg) {
        msg = this.sendFilters[key].call(this, msg);
      }
    }

    if(msg) {
      this.socket.send({
        type: "chat",
        "msg": msg
      });
    }

    $("#entryBox").val("");
  };

  Smog.Main.prototype.bindLogout = function() {
    var that = this;
    $("#logout").click(function() {
      that.socket.disconnect();
      Smog.Storage.unset("username");
      Smog.Storage.unset("username", true);
      Smog.Storage.unset("hash");
      Smog.Storage.unset("hash", true);
      window.location.href = "";
    });
  };
})();