Smog.UI = {
  hasFocus: true,

  addUser: function(username, sessId) {
    $('<li data-id="' + sessId + '" data-user="' + username +
      '">' + username + '</li>').appendTo('#userList');
  },

  deleteUser: function(username) {
    $("li[data-user='" + username + "']").remove();
  },

  displayChatMsg: function(nick, msg) {
    $('<li class="message">'+
    '<span class="timestamp"></span>'+
    '<span class="name">'+nick+'</span>: '+
    '<span class="msg">'+msg+'</span>'+
    '</li>')
      .appendTo('#container ul');
    $("li.message:last")[0].scrollIntoView();
  },

  displayInfoMsg: function(msg) {
    $('<li class="message">'+
    '<span class="timestamp"></span>'+
    '<span class="msg">'+msg+'</span>'+
    '</li>')
      .appendTo('#container ul');
    $("li.message:last")[0].scrollIntoView();
  },

  setStatus: function(color) {
    $("#microBar").css("background-color", color);
  },

  setMotd: function(msg) {
    $('#motd').html(msg);
  },

  clearTitle: function() {
    document.title = "Smog";
  },

  alertTitle: function() {
    this._title = document.title;
    document.title = "*SMOG*";
  }
};