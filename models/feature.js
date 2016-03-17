var knex = require('../connection.js');
var Promise = require('bluebird');
var dbgeo = require('dbgeo');
var log = require('../services/log.js');
var debug = require('../services/debug')('model/features');
var Layer = require('./layer');
var LayerViews = require('../services/layer-views');

module.exports = {


  getFeatureByID(osm_id, layer_id) {
    var _this = this;
    return Layer.getLayerByID(layer_id)
    .then(function(layer){
    return _this.getOSMRecord(osm_id, layer.data_type, layer.layer_id)
      .then(function(feature) {
          feature.layer = layer;
          return _this.getGeoJSON(feature.id, feature.layer_id)
          .then(function(geojson){
            feature.geojson = geojson;
            return _this.getFeatureNotes(osm_id, layer_id)
            .then(function(notes){
              var result = {feature, notes};
              return result;
            });
          });
        });

      });
  },

  getFeatureNotes(osm_id, layer_id){
    return knex('omh.feature_notes').select('notes')
    .where({osm_id, layer_id})
    .then(function(result){
      if(result && result.length == 1){
        return result[0];
      }
      return null;
    });
  },

  saveFeatureNote(osm_id, layer_id, user_id, notes){
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

  getOSMRecord(id, dataType, layer_id){

    var commands = [];
    switch(dataType){
      case 'polygon':
        commands.push(knex('current_ways').where({id, layer_id}));
        commands.push(knex('current_relations').where({id, layer_id}));
        break;
      case 'line':
        commands.push(knex('current_ways').where({id, layer_id}));
        break;
      case 'point':
        commands.push(knex('current_nodes').where({id, layer_id}));
        break;
      default:
        break;
    }

    return Promise.all(commands)
    .then(function(resultsArr) {
      var combined = [];
      resultsArr.forEach(function(result){
        combined = combined.concat(result);
      });
      var osmRecord = null;

      if(combined.length <= 0){
        log.error("No records found for id:" + id + ' for layer:' + layer_id);

      }else if(combined.length > 1){
        osmRecord = combined[0];
        log.error("More than one record found for id:" + id + ' for layer:' + layer_id);
      }else {
        //this is only one
        osmRecord = combined[0];
      }

      return osmRecord;
    });
  },


    getGeoJSON(osm_id, layer_id) {

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
            ST_AsText(ST_Transform(geom, 4326)) as geom,
            '{' || replace(tags::text, '=>', ':') || '}' as tags
            from ` + layerView + ` where osm_id=` + osm_id),
          knex.raw("select '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox from (select ST_Extent(geom) as bbox from (select ST_Transform(geom, 4326) as geom from " + layerView + " where osm_id=" + osm_id + ") a) b")
        ])
        .then(function(results) {
          var data = results[0];
          var bbox = results[1];
          return new Promise(function(fulfill, reject) {

            dbgeo.parse({
              "data": data.rows,
              "outputFormat": "geojson",
              "geometryColumn": "geom",
              "geometryType": "wkt"
            }, function(error, result) {
              if (error) {
                log.error(error);
                reject(error);
              }
              //convert tags to properties
              result.features.forEach(function(feature) {
                var tags = JSON.parse(feature.properties.tags);
                Object.keys(tags).map(function(key) {
                  var val = tags[key];
                  feature.properties[key] = val;
                });
                delete feature.properties.tags;
              });

              result.bbox = JSON.parse(bbox.rows[0].bbox);
              fulfill(result);
            });
          });

        });
      });
    },

    updateFeature(osm_id, tags){

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
