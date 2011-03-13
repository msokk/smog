(function() {
  Smog.SoundCloud = function() {
    var that = this;
    this.consumerKey = "46q8ZDUJD6nbBsaka0DgfA";
    $("footer").append('<audio id="sc-player" preload="auto"></audio>');

    Smog.filter("soundcloud", function(str) {
      if(str.indexOf("!sc") == 0) {
        var command = str.split(" ");
        if(command[1] == "play") {
          var queryString = command.slice(2).join(" ");
          that.search(queryString);
        } else if(command[1] == "pause") {
            $("#sc-player")[0].pause();
        }
        return null;
      } else {
        return str;
      }
    });
  }

  Smog.SoundCloud.prototype.search = function(str) {
    var that = this;
    $.getJSON("http://api.soundcloud.com/tracks.json?q=" + str + "&consumer_key=" +
      this.consumerKey, function(data) {
      if(data) {
        $("#sc-player").attr('src', data[0].stream_url + "?consumer_key=" + that.consumerKey);
        $("#sc-player")[0].play();
      }
    });
  };

  new Smog.SoundCloud();
})();
