/* @flow weak */
var Promise = require('bluebird');
var QuadTile = require('../services/quad-tile.js');
var queryWays = require('./query-ways.js');

module.exports = function queryBbox(knex, bbox, layer_id=null) {
  // Calculate the tiles within this bounding box.
  // See services/QuadTile.js.
  var tiles = QuadTile.tilesForArea(bbox);

  if(bbox.error) return Promise.reject(bbox.error);

/*
  // Find the nodes in the bounding box using the quadtile index.
  var containedNodes = knex('current_nodes').select('id')
    .whereIn('tile', tiles)
    .where('visible',true);

    if(layer_id){
      containedNodes = containedNodes.where('layer_id',layer_id);
    }

  var containedWayIds = knex('current_way_nodes').select('way_id')
    .leftJoin('current_nodes', 'current_way_nodes.node_id', 'current_nodes.id')
    .whereIn('current_nodes.tile', tiles)
    .where('current_nodes.visible',true);

    if(layer_id){
      containedWayIds = containedWayIds.where('current_nodes.layer_id',layer_id);
    }

    */
    return knex.transaction(function(trx) {
      return trx.raw(`
        CREATE TEMP TABLE bboxquerytempnodes AS
          SELECT distinct id FROM current_nodes
          WHERE tile in (`+ tiles.join(',') + `) AND visible=true AND layer_id = `+ layer_id
      ).then(function(){
        return trx.raw('CREATE UNIQUE INDEX bboxquerytempnodes_idx ON bboxquerytempnodes (id)')
        .then(function(){
          return queryWays(trx, layer_id)
          .then(function(result){
            return trx.raw('DROP TABLE bboxquerytempnodes').then(function(){
              return result;
            });
          });
        });
      });
    });

};
