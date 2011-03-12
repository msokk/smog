/**
 * Dynamic canvas background
 *
 * TODO: Add controls to save and redraw background
 */
(function() {

  /**
   * Injects fullscreen canvas into background
   */
  $('body').prepend(
    '<canvas style="position: fixed; z-index: 1;"'+
    ' id="bgCanvas" width="'+window.innerWidth+
    '" height="'+window.innerHeight+'"></canvas>'
  );


  /**
   * Resize and redraw the canvas with window resize
   * and rate limit the redrawing
   */
  var blocker = false;
  $(window).resize(function() {
    if(!blocker) {
      blocker = true;
      setTimeout(function() {
        $("#bgCanvas").attr('width', window.innerWidth);
        $("#bgCanvas").attr('height', window.innerHeight);
        Bg.draw();
        blocker = false;
      }, 300);
    }
  });


  /**
   * Background singleton
   */
  var Bg = window.Bg = {
    ctx: $("#bgCanvas")[0].getContext("2d"),

    //Randomized Settings
    options: {
      color: "hsl(" + Math.randRange(0, 360) + ", 30%, 50%)",
      rotation: Math.randRange(-180, 180),
      size: Math.randRange(40, 100),
      padding: Math.randRange(-10, 10),
      n: Math.randRange(2, 9),
      jitter: 20
    },


    /**
     * Main drawing method
     * Divides the canvas into cells
     * Loops over every cell with jitter
     */
    draw: function() {
      var opt = this.options,
          size = opt.size,
          width = $("#bgCanvas").width() + size * 2,
          height = $("#bgCanvas").height() + size * 2,
          columns = Math.floor(width / size),
          rows = Math.floor(height / size);

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.globalAlpha = 1.0;
      this.ctx.strokeStyle = this.options.color;

      var i, u;
      for(i = -1; i < rows; i +=1) {
        for(u = -1; u < columns; u += 1) {
          if((u % 2) == 0) {
            this.drawCell(this.ctx,
              u * size + Math.randRange(-opt.jitter, opt.jitter),
              (i * size) + size / 2 + Math.randRange(-opt.jitter, opt.jitter));
          } else {
            this.drawCell(this.ctx,
              u * size + Math.randRange(-opt.jitter, opt.jitter),
              i * size + Math.randRange(-opt.jitter, opt.jitter));
          }
        }
      }
    },


    /**
     * Draws a single cell
     *
     * @param {Object} canvas renderingcontext
     * @param {Number} cell x coordinate
     * @param {Number} cell y coordinate
     */
    drawCell: function(ctx, x, y) {
      ctx.beginPath();

      var i, n = this.options.n, r = this.options.rotation;
      for(i = 0; i < n; i += 1) {
        var pos = this.getPos(i, r);
        ctx.lineTo(x + pos.x, y + pos.y);
      }

      ctx.closePath();
      ctx.stroke();
    },


    /**
     * Fetches n-th coordinate of shape
     * @param {Number} n-th corner
     * @param {Number} applied rotation
     * @returns {Object} x and y coordinate
     */
    getPos: function(i, rotateDeg) {
      var rad = ((2*Math.PI)/this.options.n) * i + (rotateDeg/180) * Math.PI,
          size = this.options.size - this.options.padding;
      var normalise = function(v) {
        return (v * size)/2 + size/2;
      }
      return {
        x: normalise(Math.cos(rad)),
        y: normalise(Math.sin(rad))
      }
    },


    save: function() {
      
    }


  };


  Bg.draw();

})();