/* @flow weak */

var _zipObject = require('lodash.zipobject');
var ratio = require('../services/ratio.js');

/*
 * Takes the given way/waynode/node models and returns a FeatureCollection
 * of LineString features--one for each way.
 *
 * `data` is as yielded by ../services/query-ways.js
 */
module.exports = function toGeoJSON(data) {

  var idToNode = {}; // TODO:this should be a real hashmap
  data.nodes.forEach(function (n) { idToNode[n.id] = n; });

  var wayFeatures = data.ways.map(function (way) {
    var nodeCoordinates = way.nodes.map(function (waynode) {
      var node = idToNode[waynode.node_id];
      return [node.longitude / ratio, node.latitude / ratio];
    });

    var properties = _zipObject(way.tags.map(function (t) {
      return [t.k, t.v];
    }));

    return {
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates: nodeCoordinates
      }
    };
  });

  return {
    type: 'FeatureCollection',
    properties: {},
    features: wayFeatures
  };
};
