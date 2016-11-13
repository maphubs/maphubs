/* @flow weak */
var linestring = require('@turf/helpers').lineString;
var point = require('@turf/helpers').point;
var inside = require('@turf/inside');

// clip the given LineString features to the given polygon.
// returns a new list of LineStrings, possibly longer than the original
// since a single line might get clipped into multiple lines.
module.exports = function clip(lines, polygon) {
  var result = [];
  lines.forEach(function (feat) {
    var coords = feat.geometry.coordinates;

    // array of coordinate pairs of linestring we're building
    var current = [];

    function pushLine() {
      if(current.length > 0) {
        result.push(linestring(current, feat.properties));
        current = [];
      }
    }

    // scan through the current input linestring, adding clipped
    // lines to the output as we hit the boundaries of the mask
    for(var i = 0; i < coords.length; i++) {
      var ins = inside(point(coords[i]), polygon);
      if(ins) {
        current.push(coords[i]);
      }
      else {
        pushLine();
      }
    }

    pushLine();
  });

  return result;
};
