// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var dbgeo = require('dbgeo');
var log = require('../services/log.js');
//var debug = require('../services/debug')('model/features');
var geojsonUtils = require('../services/geojson-utils');

module.exports = {


  getFeatureByID(mhid: string, layer: Object) {
    var _this = this;
    return _this.getGeoJSON(mhid, layer.layer_id)
      .then(function(geojson){
        var feature = {geojson};
        return _this.getFeatureNotes(mhid, layer.layer_id)
        .then(function(notes){
          var result = {feature, notes};
          return result;
        });
    });
  },

  getFeatureNotes(mhid: string, layer_id: number){
    return knex('omh.feature_notes').select('notes')
    .where({mhid, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return result[0];
      }
      return null;
    });
  },

  saveFeatureNote(mhid: string, layer_id: number, user_id: number, notes: string){
    return knex('omh.feature_notes').select('mhid').where({mhid, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return knex('omh.feature_notes')
        .update({
          notes,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        })
        .where({mhid, layer_id});
      }else{
        return knex('omh.feature_notes')
        .insert({
          layer_id,
          mhid,
          notes,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
      }
    });
  },

    getGeoJSON(mhid: string, layer_id: number) {

      var layerTable = 'layers.data_' + layer_id;       
      return Promise.all([
        knex.raw(
          `select mhid,
          ST_AsGeoJSON(wkb_geometry) as geom, tags
          from ${layerTable} where mhid='${mhid}'`),
        knex.raw(`select 
        '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
        from (select ST_Extent(wkb_geometry) as bbox from ${layerTable} where mhid='${mhid}') a`)
      ])
      .then(function(results) {
        var data = results[0];
        var bbox = results[1];
        return new Promise(function(fulfill, reject) {
          dbgeo.parse(data.rows,{
            "outputFormat": "geojson",
            "geometryColumn": "geom",
            "geometryType": "geojson"
          }, function(error, result) {
            if (error) {
              log.error(error);
              reject(error);
            }
            //convert tags to properties
            result.features = geojsonUtils.convertTagsToProps(result.features);
            result.bbox = JSON.parse(bbox.rows[0].bbox);
            fulfill(result);
          });
        });
      });
    }

};
