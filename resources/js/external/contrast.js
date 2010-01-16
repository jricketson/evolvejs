/*
  Color Contrast | Andrew Waer 
  Origins: http://juicystudio.com/services/colourcontrast.php

  Usage:
 
  // Contrast test for two colors
  // returns passing score OR false if test fails
  Contrast.test('#ffffff', '#000000');

  // find best match from one or two color sets
  // returns array containing two hex values OR false if no match
  Contrast.match('#ffffff', ['#000000', '#336699']);
  Contrast.match(['#ffffff', '#000000', '#336699']);
  Contrast.match(['#ffffff','#ffffcc'], ['#000000', '#336699']);
*/

var Contrast = function()
{
  // private functions and properties
  var _private =
  {
    min : { 
      'brightness': 125, 
      'difference': 500 
    },
    brightness : function(rgb1, rgb2){
      var b1 = ((rgb1.r * 299) + (rgb1.g * 587) + (rgb1.b * 114)) / 1000;
      var b2 = ((rgb2.r * 299) + (rgb2.g * 587) + (rgb2.b * 114)) / 1000;
      return Math.abs(Math.round(b1-b2));
    },
    difference : function(rgb1, rgb2){
      var diff = (Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r)) + 
                 (Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g)) + 
                 (Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b));
      return Math.abs(Math.round(diff));
    },
    rgb : function(hex){
      hex = hex.replace('#','');
      var rgb = {
        r: parseInt(hex[0] + hex[1], 16),
        g: parseInt(hex[2] + hex[3], 16),
        b: parseInt(hex[4] + hex[5], 16)
      };
      return rgb;
    }
  };
  // public functions and properties
  var _public =
  {
    test : function(hex1, hex2){
      var rgb1 = _private.rgb(hex1);
      var rgb2 = _private.rgb(hex2);
      var brightness = _private.brightness(rgb1, rgb2);
      var difference = _private.difference(rgb1, rgb2);
      return (
        brightness >= _private.min.brightness && difference >= _private.min.difference
          ? ((brightness - _private.min.brightness) + (difference - _private. min.difference))
          : false
      );
    },
    match : function(hex1, hex2){
      var total_score, i, j;

      if (typeof hex1 == 'string') {hex1 = [hex1];}
      if (typeof hex2 == 'string') {hex2 = [hex2];}
      var best_match = { 
        score: 0,
        hex1:  null,
        hex2:  null
      };
      if (hex2 == null){
        for (i=0; i<hex1.length; i++){
          for (j=0; j<hex1.length; j++){
            total_score = _public.test(hex1[i], hex1[j]);
            if (total_score > best_match.score){
              best_match.score = total_score;
              best_match.hex1 = hex1[i];
              best_match.hex2 = hex1[j];
            }
          }
        }
      } 
      else {
        for (i=0; i<hex1.length; i++){
          for (j=0; j<hex2.length; j++){
            total_score = _public.test(hex1[i], hex2[j]);
            if (total_score > best_match.score){
              best_match.score = total_score;
              best_match.hex1 = hex1[i];
              best_match.hex2 = hex2[j];
            }
          }
        }
      }
      return (
        best_match.score > 0
        ? [ best_match.hex1, best_match.hex2 ]
        : false
      );
    }
  };
  return _public;
}();
