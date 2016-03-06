var knex = require('../connection.js');
var dbgeo = require('dbgeo');
var Promise = require('bluebird');
var log = require('../services/log.js');
var _find = require('lodash.find');
var PresetUtils = require('../services/preset-utils');
var LayerViews = require('../services/layer-views');
var DataLoadUtils = require('../services/data-load-utils');
var Group = require('./group');
var Map = require('./map');
var debug = require('../services/debug')('model/layers');
var ScreenshotUtils = require('../services/screenshot-utils');

module.exports = {

  getAllLayers(includeMapInfo = false) {
    if(includeMapInfo){
      return knex.select('layer_id', 'name', 'description', 'data_type',
      'status', 'published', 'source', 'license', 'presets',
      'is_external', 'external_layer_config',
      'owned_by_group_id', 'last_updated', 'views',
      'style', 'legend_html', 'extent_bbox', 'preview_position')
      .table('omh.layers').where('published', true).orderBy('name');
    }else{
      return knex.select('layer_id', 'name', 'description', 'data_type',
      'status', 'published', 'source', 'license', 'presets',
      'is_external', 'external_layer_config', 'owned_by_group_id',
      'last_updated', 'views')
      .table('omh.layers').where('published', true).orderBy('name');
    }

  },

  getRecentLayers(number = 15){
    return knex.select('layer_id', 'name', 'description', 'data_type',
    'status', 'published', 'source', 'license',
    'is_external', 'external_layer_config',
     'owned_by_group_id', 'last_updated', 'views')
    .table('omh.layers')
    .where('published', true)
    .orderBy('last_updated', 'desc')
    .limit(number);
  },

  getFeaturedLayers(number = 15){
    return knex.select('layer_id', 'name', 'description', 'data_type',
    'status', 'published', 'source', 'license',
    'is_external', 'external_layer_config',
     'owned_by_group_id', 'last_updated', 'views')
    .table('omh.layers')
    .where({published: true, featured: true})
    .orderBy('name')
    .limit(number);
  },

  getSearchSuggestions(input) {
    input = input.toLowerCase();
    return knex.select('name', 'layer_id').table('omh.layers').whereRaw("lower(name) like '%" + input + "%'").orderBy('name');
  },

  getSearchResults(input) {
    input = input.toLowerCase();
    return knex('omh.layers')
    .select('layer_id', 'name', 'description', 'data_type',
    'status', 'published', 'source', 'license', 'style', 'legend_html',
    'is_external', 'external_layer_config', 'owned_by_group_id', 'last_updated', 'views')
    .whereRaw("lower(name) like '%" + input + "%'").orderBy('name');
  },

  getGroupLayers(group_id, includePrivate = false) {
    var query = knex.select('layer_id', 'name', 'description', 'data_type',
    'status', 'published', 'source', 'license',
    'is_external', 'external_layer_config', 'owned_by_group_id', 'last_updated', 'views')
    .table('omh.layers').orderBy('name');

    if (includePrivate) {
      query.where('owned_by_group_id', group_id);
    } else {
      query.where({
        'published': true,
        'owned_by_group_id': group_id
      });
    }

    return query;
  },

  getLayerByID(layer_id, trx = null) {
    debug('getting layer: ' + layer_id);
    let db = knex;
    if(trx){db = trx;}
    return db.select().table('omh.layers').where('layer_id', layer_id)
      .then(function(result) {
        if (result && result.length == 1) {
          return result[0];
        }
        //else
        return null;
      });
  },

  getLayerInfo(layer_id){
    return knex('omh.layers')
    .select('layer_id', 'name', 'description', 'owned_by_group_id')
    .where('layer_id', layer_id)
    .then(function(result){
      if (result && result.length == 1) {
        return result[0];
      }
      return null;
    });
  },

  getHubLayers(hub_id, includePrivate = false) {
    var query = knex.select(
    'omh.layers.layer_id', 'omh.layers.name', 'omh.layers.description', 'omh.layers.data_type',
    'omh.layers.status', 'omh.layers.published', 'omh.layers.source', 'omh.layers.license',
    'omh.layers.is_external', 'omh.layers.external_layer_config',
    'omh.layers.owned_by_group_id', 'omh.layers.last_updated', 'omh.layers.views',
    'omh.layers.style', 'omh.layers.legend_html', 'omh.layers.extent_bbox', 'omh.layers.preview_position',
     'omh.hub_layers.active', 'omh.hub_layers.position', 'omh.hub_layers.hub_id', 'omh.hub_layers.style as map_style', 'omh.hub_layers.legend_html as map_legend_html')
      .from('omh.hub_layers')
      .leftJoin('omh.layers', 'omh.hub_layers.layer_id', 'omh.layers.layer_id').orderBy('position');

    if (includePrivate) {
      query.where('omh.hub_layers.hub_id', hub_id);
    } else {
      query.where({
        'omh.layers.published': true,
        'omh.hub_layers.hub_id': hub_id
      });
    }

    return query;
  },

  allowedToModify(layer_id, user_id, trx=null){
    if(!layer_id || !user_id){
      return false;
    }
    return this.getLayerByID(layer_id, trx)
      .then(function(layer){
           return Group.getGroupMembers(layer.owned_by_group_id)
          .then(function(users){
            if(_find(users, {id: user_id}) !== undefined){
              return true;
            }
            return false;
          });
      });
    },

    getGeoJSON(layer_id) {
      return this.getLayerByID(layer_id)
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
          knex.raw("select osm_id, ST_AsText(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags from " + layerView),
          knex.raw("select '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox from (select ST_Extent(geom) as bbox from (select ST_Transform(geom, 4326) as geom from " + layerView + ") a) b")
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

    createLayer(name, description, group_id, published, user_id){
      return knex('omh.layers').returning('layer_id')
        .insert({
          name, description,
          owned_by_group_id: group_id,
            published,
            status: 'incomplete',
            created_by_user_id: user_id,
            creation_time: knex.raw('now()'),
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
        });
    },

    /*
    Used by delete
    */
    removeLayerFromMaps(layer_id, trx = null){
      //get maps that use this layer
      let db = knex;
      if(trx){db = trx;}
      return db.select('map_id').from('omh.map_layers').where({layer_id})
      .then(function(results){
        var mapLayerQuerys = [];
        results.forEach(function(result){
          //get layers for map
          var map_id = result.map_id;
          debug('removing layer: ' + layer_id + ' from map: '+ map_id);
          mapLayerQuerys.push(Map.getMapLayers(map_id, db));
        });
        return db('omh.map_layers').where({layer_id}).del()
        .then(function(){
          return Promise.all(mapLayerQuerys)
          .then(function(results){
            var saveMapStyleCommands = [];
            results.forEach(function(result){
              //rebuild map style, excluding the removed layer
              var layers = result;
              var map_id = result[0].map_id;
              //TODO: this will wipe out any custom styles from the map maker, need to use style from map_layers table instead...
              var style = Map.buildMapStyle(layers);
              saveMapStyleCommands.push(db('omh.maps').where({map_id}).update({style, screenshot: null, thumbnail: null}));
            });
            return Promise.all(saveMapStyleCommands)
            .then(function(result){
              //remove layer from maps
              //TODO: notify map owners that a layer has been removed

                return result;
            });
          });
        });
      });
    },

    removeLayerFromHubs(layer_id, trx = null){
      var _this = this;
      let db = knex;
      if(trx){db = trx;}
      //get hubs that use this layer
      return db.select('hub_id').from('omh.hub_layers').where({layer_id})
      .then(function(results){
        var hubLayerQuerys = [];
        results.forEach(function(result){
          //get layers for hub
          var hub_id = result.hub_id;
          debug('removing layer: ' + layer_id + ' from hub: '+ hub_id);
          hubLayerQuerys.push(_this.getHubLayers(hub_id, db));
        });
        return db('omh.hub_layers').where({layer_id}).del()
        .then(function(){
          return Promise.all(hubLayerQuerys)
          .then(function(results){
            var saveHubStyleCommands = [];
            results.forEach(function(result){
              //rebuild map style, excluding the removed layer
              var layers = result;
              var hub_id = result[0].hub_id;
              var map_style = Map.buildMapStyle(layers);
              saveHubStyleCommands.push(db('omh.hubs').where({hub_id}).update({map_style}));
            });
            return Promise.all(saveHubStyleCommands)
            .then(function(result){
              //TODO: notify hub owners that a layer has been removed
                return result;
            });
          });
        });
      });
    },

    delete(layer_id){
      var _this = this;
      return knex.transaction(function(trx) {
        var commands = [
          DataLoadUtils.removeLayerData(layer_id, trx),
          trx('omh.layer_views').where({layer_id}).del(),
          _this.removeLayerFromMaps(layer_id, trx),
          _this.removeLayerFromHubs(layer_id, trx),
          trx('omh.layers').where({layer_id}).del()
        ];

        return Promise.each(commands, function(command){
          return command;
        }).then(function(){
          //TODO: notify group owners that a layer has been removed
          //TODO: notify hub owners that a layer has been removed
          //TODO: notify map owners that a layer has been removed
          return true;
        })
        .catch(function (err) {
          debug(err);
          throw err;
        });
    });


    },

    saveSettings(layer_id, name, description, group_id, published, user_id) {
        return knex('omh.layers')
          .update({
            name, description,
            owned_by_group_id: group_id,
              published,

              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          }).where({layer_id});
    },

    saveDataSettings(layer_id, is_external, external_layer_type, external_layer_config, user_id){
      return knex('omh.layers').where({
          layer_id
        })
        .update({
          is_external,
          external_layer_type,
          external_layer_config: JSON.stringify(external_layer_config),
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
        });
    },


    saveSource(layer_id, source, license, user_id) {
      return knex('omh.layers').where({
          layer_id
        })
        .update({
          source,
          license,
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
        });
    },

    saveStyle(layer_id, style, legend_html, preview_position, user_id) {
      return knex('omh.layers').where({
          layer_id
        })
        .update({
          style: JSON.stringify(style),
          legend_html,
          preview_position,
          updated_by_user_id: user_id,
          last_updated: knex.raw('now()')
        }).then(function(){
          //update the thumbnail
          return ScreenshotUtils.reloadLayerThumbnail(layer_id);
        });
    },


    savePresets(layer_id, presets, user_id, create, trx=null) {
      let db = knex;
      if(trx){db = trx;}
      if(create){
        //just insert them
        return db('omh.layers').where({
            layer_id
          })
          .update({
              presets: JSON.stringify(presets),
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          });
      } else {
        //TODO: handle preset changes
        //loop through presets and find any that have:
        //1)changed the tag
        //2) have been deleted (if we want to actually delete them??)

        presets.forEach(function(preset){
          if(preset.prevTag !== undefined){
            PresetUtils.renameTag(layer_id, preset.prevTag, preset.tag);
          }
        });

        //update the Data
        return db('omh.layers').where({
            layer_id
          })
          .update({
              presets: JSON.stringify(presets),
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
          }).then(function(result){
            return {success: true, result};
          });
      }

    }



};
