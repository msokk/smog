Smog.Storage = (function() {
  var type = session = "sessionStorage",
      local = "localStorage";

  if(!window[type]) {
    throw "Missing "+type+"!";
  }

  return {
    get : function(key, persistent) {
      return window[(persistent)? local: session].getItem(key);
    },
    set : function(key, value, persistent) {
      window[(persistent)? local: session].setItem(key, value);
    },

    unset : function(key, persistent) {
      window[(persistent)? local: session].removeItem(key);
    }
  }
})();