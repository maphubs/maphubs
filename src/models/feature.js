// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var dbgeo = require('dbgeo');
var log = require('../services/log.js');
var debug = require('../services/debug')('model/features');
var Layer = require('./layer');
var LayerViews = require('../services/layer-views');
var geojsonUtils = require('../services/geojson-utils');

module.exports = {


  getFeatureByID(osm_id: string, layer: Object) {
    var _this = this;
    return _this.getOSMRecord(osm_id, layer.layer_id)
      .then(function(featureResults) {
        var feature = featureResults[0];
        return _this.getGeoJSON(osm_id, layer.layer_id)
        .then(function(geojson){
          feature.geojson = geojson;
          return _this.getFeatureNotes(osm_id, layer.layer_id)
          .then(function(notes){
            var result = {feature, notes};
            return result;
          });
        });
      });
  },

  getFeatureNotes(osm_id: string, layer_id: number){
    return knex('omh.feature_notes').select('notes')
    .where({osm_id, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return result[0];
      }
      return null;
    });
  },

  saveFeatureNote(osm_id: string, layer_id: number, user_id: number, notes: string){
    return knex('omh.feature_notes').select('osm_id').where({osm_id, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return knex('omh.feature_notes')
        .update({
          notes,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        })
        .where({osm_id, layer_id});
      }else{
        return knex('omh.feature_notes')
        .insert({
          layer_id,
          osm_id,
          notes,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
      }
    });
  },

  getOSMRecord(id: string, layer_id: number){
    var osm_id = id.substring(1);
    debug('getting osm record for: ' + id + ' - '+ osm_id);
    if(id.startsWith('n')){
      return knex('current_nodes').where({id:osm_id, layer_id});
    }else if(id.startsWith('w') || id.startsWith('p')){
      return knex('current_ways').where({id:osm_id, layer_id});
    }else if(id.startsWith('m')){
      return knex('current_relations').where({id:osm_id, layer_id});
    }else{
      log.error('old osm_id found: ' + id);
      throw new Error('old osm_id found: ' + id);
    }
  },

    //TODO: [Privacy]
    getGeoJSON(osm_id: string, layer_id: number) {

      return Layer.getLayerByID(layer_id)
      .then(function(layer){
        var layerView = '';
        switch(layer.data_type){
          case 'polygon':
            layerView = 'layers.polygons_' + layer_id;
            break;
          case 'line':
            layerView = 'layers.lines_' + layer_id;
            break;
          case 'point':
            layerView = 'layers.points_' + layer_id;
            break;
          default:
          layerView = 'layers.polygons_' + layer_id;
          break;
        }

      return Promise.all([
          knex.raw(
            `select osm_id,
            ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom,
            '{' || replace(tags::text, '=>', ':') || '}' as tags
            from ` + layerView + ` where osm_id='` + osm_id + "'"),
          knex.raw("select '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox from (select ST_Extent(geom) as bbox from (select ST_Transform(geom, 4326) as geom from " + layerView + " where osm_id='" + osm_id + "') a) b")
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
      });
    },

    //not used?
    updateFeature(osm_id: string, tags: Object){

      return this.getOSMRecord(osm_id)
        .then(function(feature) {
          return Layer.getLayerByID(feature.layer_id)
          .then(function(layer){
            var tagsTable = '', idField = '';
            switch(layer.data_type){
              case 'polygon':
                tagsTable = 'current_relation_tags';
                idField = 'relation_id';
                break;
              case 'line':
                tagsTable = 'current_way_tags';
                idField = 'way_id';
                break;
              case 'point':
                tagsTable = 'current_node_tags';
                idField = 'node_id';
                break;
              default:
                tagsTable = 'current_relation_tags';
                idField = 'relation_id';
                break;
            }
            var updates = [];
            for (var k in tags) {
              var v = tags[k];
              var statement = knex(tagsTable).update({k: v}).where(idField, feature.id)
              .then(function(result){
                //TODO: in postgresql 9.5 we can update this to an UPSERT http://www.craigkerstiens.com/2015/05/08/upsert-lands-in-postgres-9.5/

                  if(result === 0){
                    var insert = {};
                    insert[idField] = feature.id;
                    insert.k = v;
                    return knex(tagsTable).insert(insert);
                  } else {
                    return true;
                  }
              });
              updates.push(statement);
            }
            return Promise.all(updates)
            .then(function(){
              //update views
              debug('updating layer views');
              LayerViews.updateMaterializedViews(layer.layer_id)
              .then(function(){
                return {success: true};
              });
            });
          });
        });

    }

};
