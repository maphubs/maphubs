/* @flow weak */
var Promise = require('bluebird');
var debug = require('../services/debug')('global-views');

module.exports = {

  updateMaterializedViews(trx){
    debug('update global materialized views');
    var commands = [
      'REFRESH MATERIALIZED VIEW postgis_node_geom WITH DATA;',
      'REFRESH MATERIALIZED VIEW postgis_way_geom WITH DATA;',
      'REFRESH MATERIALIZED VIEW postgis_polygon_geom WITH DATA;'
    ];
    return Promise.each(commands, function(command){
      return trx.raw(command);
    })
    .catch(function (err) {
      debug(err);
      throw err;
    });
  }

}
