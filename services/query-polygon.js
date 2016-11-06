/* @flow weak */

var knex = require('../connection.js');
var clip = require('./clip.js');
var toGeoJSON = require('./osm-data-to-geojson.js');
var queryBbox = require('./query-bbox.js');
var BoundingBox = require('./bounding-box.js');

// Query the given GeoJSON Polygon Feature, returning a promise to be
// fulfilled with a GeoJSON FeatureCollection representing the (clipped)
// roads within that polygon.

//not used?
module.exports = function(boundary) {
  var bbox = new BoundingBox.FromCoordinates(require('@turf/bbox')(boundary));

  return queryBbox(knex, bbox)
  .then(function (result) {
    var roads = toGeoJSON(result);
    roads.features = clip(roads.features, boundary);
    roads.properties = boundary.properties;
    return roads;
  });
};
