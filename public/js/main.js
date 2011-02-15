var Smog = {
  ver: 0.1,
  debug : true,
  log : function (msg) {
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
    var that = this;
    var socket = this.socket = new io.Socket();
    socket.connect();
    socket.on('message', function(data){
      Smog.log(data);
      that.route(data);
    });
    
    //Global objects for modules
    Smog.routes = [];
    Smog.sendFilters = [];
    
    //Core functionality uses same system
    Smog.Core.init();
    
    this.bindLogin();
    this.bindInput();
  };
  
  
  Smog.Main.prototype.bindInput = function() {
    var that = this;
    $("#entryBtn").click(function() { that.sendMsg() });
    $('#entryBox').keypress(function(e) {
      if (e.which == '13') {
        that.sendMsg();
      }
    });
  };
  
  Smog.Main.prototype.bindLogin = function() {
    var that = this;
    if(!Smog.Storage.get("username")) {
      var user = "",
          credentials = $('#credentials');
      credentials.focus();
      
      credentials.keypress(function(event) {
        if (event.which == '13') {
          
          //Username input
          if(!user) {Box
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
      that.socket.send({ 
        type: "login-request",
        username: Smog.Storage.get("username"),
        hash: Smog.Storage.get("hash")
      });
    }
  };
  
  Smog.Main.prototype.sendMsg = function() {
    var msg = $("#entryBox").val();
    for(var i = 0; i < Smog.sendFilters.length; i++) {
      msg = Smog.sendFilters[i](msg);
    }
    
    if(msg) {
      this.socket.send({
        type: "chat",
        "msg": msg
      });
    }
    
    $("#entryBox").val("");
  };
  

  Smog.Main.prototype.route = function(data) {
    var routes = Smog.routes;
    for(var i = 0; i < routes.length; i++) {
      if(routes[i].type == data.type) {
        routes[i].command(data);
      }
    }
  };
  
  Smog.Core = {
    init: function() {
      
      Smog.sendFilters.push(function(str) {
        return str.replace(/&/g,'&amp;')
                  .replace(/</g,'&lt;')
                  .replace(/>/g,'&gt;');
      });
    
      Smog.routes.push({
        type: "login-success",
        command: function(data) {
          
          //Store username and hash for autologin
          if(Smog.Storage.get("username")) {
            $("#loginPane").remove();
            $("#overlay").remove();
          } else {
            Smog.Storage.set("username", Smog.username);
            Smog.Storage.set("hash", Smog._hash);
            delete Smog._hash;
            
            $("#loginPane").fadeOut(1000, function() { $(this).remove(); });
            $("#overlay").fadeOut(1000, function() { $(this).remove(); });
          }
          
          $('#entryBox').focus();
          
          Smog.UI.displayInfoMsg("Logged in! Modules : " +
            JSON.stringify(data.modules));
          for(var i = 0; i < data.modules.length; i++) {
            head.js("modules/" + data.modules[i]);
          }
        }
      }, {
        type: "login-fail",
        command: function(data) {
          Smog.UI.displayInfoMsg(data.msg);
        }
      }, {
        type: "chat-new",
        command: function(data) {
          Smog.UI.displayInfoMsg(data.username + " liitus!");
        }
      }, {
        type: "chat-leave",
        command: function(data) {
          Smog.UI.displayInfoMsg(data.username + " lahkus!");
        }     
      }, {
        type: "chat",
        command: function(data) {
          Smog.UI.displayChatMsg(data.username, data.msg);
        }
      });
    }
  };

  Smog.UI = {
    displayChatMsg : function(nick, msg) {
      $('<li class="message">'+
      '<span id="timestamp"></span>'+
      '<span id="name">'+nick+'</span>: '+
      '<span id="content">'+msg+'</span>'+
      '</li>')
        .appendTo('#container ul')
        .fadeIn();
        $('#content').scrollTop($('ul').height());
    },
    displayInfoMsg : function(msg) {
      $('<li class="message">'+
      '<span id="timestamp"></span>'+
      '<span id="content">'+msg+'</span>'+
      '</li>')
        .appendTo('#container ul')
        .fadeIn();
        $('#content').scrollTop($('ul').height());
    }
  };
  
  Smog.Storage = (function() {
    
    var hasSupport = function() {
      if(!window.sessionStorage) {
        throw "Missing sessionStorage!";
      }
    };
    
    return {
      get : function(key) {
        hasSupport();
        return window.sessionStorage.getItem(key);
      },
      set : function(key, value) {
        hasSupport();
        window.sessionStorage.setItem(key, value);
      },
      
      unset : function(key) {
        hasSupport();
        window.sessionStorage.removeItem(key);
      }
    }
  })();

})();






/* A JavaScript implementation of the Secure Hash Algorithm, SHA-256
 * Version 0.3 Copyright Angel Marin 2003-2004 - http://anmar.eu.org/
 * Distributed under the BSD License
 */
var chrsz=8;function safe_add(a,c){var d=(a&65535)+(c&65535);return(a>>16)+(c>>16)+(d>>16)<<16|d&65535}function S(a,c){return a>>>c|a<<32-c}function R(a,c){return a>>>c}function Ch(a,c,d){return a&c^~a&d}function Maj(a,c,d){return a&c^a&d^c&d}function Sigma0256(a){return S(a,2)^S(a,13)^S(a,22)}function Sigma1256(a){return S(a,6)^S(a,11)^S(a,25)}function Gamma0256(a){return S(a,7)^S(a,18)^R(a,3)}function Gamma1256(a){return S(a,17)^S(a,19)^R(a,10)}
function core_sha256(a,c){var d=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,
3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],b=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],f=Array(64),g,i,j,m,h,k,l,n,o,e,p,q;a[c>>5]|=128<<24-c%32;a[(c+64>>9<<4)+15]=c;for(o=0;o<a.length;o+=16){g=b[0];i=b[1];j=b[2];m=b[3];h=b[4];k=b[5];l=b[6];n=b[7];for(e=0;e<64;e++){f[e]=e<16?a[e+o]:
safe_add(safe_add(safe_add(Gamma1256(f[e-2]),f[e-7]),Gamma0256(f[e-15])),f[e-16]);p=safe_add(safe_add(safe_add(safe_add(n,Sigma1256(h)),Ch(h,k,l)),d[e]),f[e]);q=safe_add(Sigma0256(g),Maj(g,i,j));n=l;l=k;k=h;h=safe_add(m,p);m=j;j=i;i=g;g=safe_add(p,q)}b[0]=safe_add(g,b[0]);b[1]=safe_add(i,b[1]);b[2]=safe_add(j,b[2]);b[3]=safe_add(m,b[3]);b[4]=safe_add(h,b[4]);b[5]=safe_add(k,b[5]);b[6]=safe_add(l,b[6]);b[7]=safe_add(n,b[7])}return b}
function str2binb(a){for(var c=[],d=(1<<chrsz)-1,b=0;b<a.length*chrsz;b+=chrsz)c[b>>5]|=(a.charCodeAt(b/chrsz)&d)<<24-b%32;return c}function binb2hex(a){for(var c="",d=0;d<a.length*4;d++)c+="0123456789abcdef".charAt(a[d>>2]>>(3-d%4)*8+4&15)+"0123456789abcdef".charAt(a[d>>2]>>(3-d%4)*8&15);return c}function hex_sha256(a){return binb2hex(core_sha256(str2binb(a),a.length*chrsz))};
