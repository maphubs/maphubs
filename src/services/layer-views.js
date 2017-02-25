/* @flow weak */
var knex = require('../connection.js');
var Promise = require('bluebird');
var debug = require('./debug')('layer-views');
var logRethrow = require('./error-response').logRethrow;
//var GlobalViews = require('./global-views');
var log = require('./log');

module.exports = {

  replaceViews(layer_id, presets, trx){
    debug("replace views for layer: " + layer_id);
    var _this = this;
    return _this.dropLayerViews(layer_id, trx)
    .then(function(){
      return _this.createLayerViews(layer_id, presets, trx);
    }).catch(logRethrow());
  },

  dropLayerViews(layer_id, trx = null){
    debug("drop views for layer: " + layer_id);
    let db = knex;
    if(trx){db = trx;}
    var commands = [
      `DROP VIEW IF EXISTS layers.centroids_${layer_id}`,
      `DROP VIEW IF EXISTS layers.data_full_${layer_id}`
    ];

    return Promise.each(commands, function(command){
      return db.raw(command).catch(function(err){
        log.error(err.message); //don't propagate errors in case we are recovering from a incomplete layer
      });
    }).catch(logRethrow());
  },

  createLayerViews(layer_id, presets, trx = null){
    let db = knex;
    if(trx){db = trx;}
    debug("create views for layer: " + layer_id);
    var tagColumns = '';
    if(presets){
      presets.forEach(function(preset){
        if(preset.type === 'number'){
          tagColumns += `(tags->>'` + preset.tag + `')::real as "` + preset.tag + `",`;
        }else{
          tagColumns += `(tags->>'` + preset.tag + `')::text as "` + preset.tag + `",`;
        }
      });
    }

    var commands = [
      
      `CREATE OR REPLACE VIEW layers.data_full_` + layer_id + ` AS
      SELECT
      mhid, ${layer_id}::integer as layer_id, ST_Transform(wkb_geometry, 900913)::geometry(Geometry, 900913) as geom,`
      + tagColumns +
      ` tags FROM layers.data_${layer_id}
      ;`,

      `CREATE OR REPLACE VIEW layers.centroids_${layer_id} AS
      SELECT
      st_centroid(geom)::geometry(Point,900913) as centroid, * 
      FROM layers.data_full_${layer_id};`

    ];

    return Promise.each(commands, function(command){
      //debug(command);
      return db.raw(command).catch(logRethrow());
    }).catch(logRethrow());
  }
};
