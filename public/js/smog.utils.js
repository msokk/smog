Smog.load = function(name, callback) {
  var head= document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  if(callback) {
    script.onload = function() { callback(); };
  }
  script.src = "js/modules/" + name + ((Smog.debug)? "?ts=" + new Date().getTime() : "");
  head.appendChild(script);
};

/**
 * Returns random decimal number in the range
 * @param {Number} from
 * @param {Number} to
 * @return {Number}
 */
Math.randRange = function(from, to) {
  return from + Math.round(Math.random() * (to - from));
}