/* @flow weak */
var knex = require('../connection.js');
var GJV = require("geojson-validation");
var log = require('./log');
var local = require('../local');
var debug = require('./debug')('data-load-utils');
var geojson2osm = require('./geojson_to_macrocosm');
var Changeset = require('./changeset');
var fs = require('fs');
//var XML = require('./xml');
var LayerViews = require('./layer-views');
var Promise = require('bluebird');
var sizeof = require('object-sizeof');
var styles = require('../components/Map/styles');

var LARGE_DATA_THRESHOLD = 20000000;

module.exports = {

  removeLayerData(layer_id, trx = null){
    debug('removeLayerData');
    let db = knex;
    if(trx){db = trx;}
    //remove views
    return LayerViews.dropLayerViews(layer_id, trx).then(function(){
      //delete data from OSM
      var commands = [
          'DELETE FROM current_relation_tags WHERE relation_id IN (SELECT id FROM current_relations WHERE layer_id =' + layer_id + ')',
          'DELETE FROM current_relation_members WHERE relation_id IN (SELECT id FROM current_relations WHERE layer_id =' + layer_id + ')',
          'DELETE FROM current_relations WHERE layer_id =' + layer_id,
          'DELETE FROM current_way_tags WHERE way_id IN (SELECT id FROM current_ways WHERE layer_id =' + layer_id + ')',
          'DELETE FROM current_way_nodes WHERE way_id IN (SELECT id FROM current_ways WHERE layer_id =' + layer_id + ')',
          'DELETE FROM current_ways WHERE layer_id =' + layer_id,
          'DELETE FROM current_node_tags WHERE node_id IN (SELECT id FROM current_nodes WHERE layer_id =' + layer_id + ')',
          'DELETE FROM current_nodes WHERE layer_id =' + layer_id
      ];
      return Promise.each(commands, function(command){
        return db.raw(command);
      });
    });

  },

  storeTempShapeUpload(uploadtmppath, layer_id, trx = null){
    debug('storeTempShapeUpload');
    let db = knex;
    if(trx){db = trx;}
    return db('omh.temp_data').where({layer_id}).del()
    .then(function(){
      return db('omh.temp_data').insert({
        layer_id,
        uploadtmppath
      });
    });
  },

  getTempShapeUpload(layer_id, trx = null){
    debug('getTempShapeUpload');
    let db = knex;
    if(trx){db = trx;}
    return db('omh.temp_data').where({layer_id})
    .then(function(result){
      return result[0].uploadtmppath;
    });
  },

  storeTempGeoJSON(geoJSON, uploadtmppath, layer_id, update, trx = null){
    debug('storeTempGeoJSON');
    let db = knex;
    if(trx){db = trx;}
    return new Promise(function(fulfill, reject) {
    var result = {success: false, error: 'Unknown Error'};
    var uniqueProps = [];

    if(!geoJSON){
      reject(new Error("Error dataset missing."));
      return;
    }
    //confirm that it is a feature collection
    if(geoJSON.type === "FeatureCollection"){

      //Error if the FeatureCollection is empty
      if(!geoJSON.features || geoJSON.features.length ==0){
        reject(new Error("Dataset appears to be empty. Zero features found in FeatureCollection"));
        return;
      }

      let firstFeature = geoJSON.features[0];
      //get type and SRID from the first feature
      var geomType = '';
      var firstFeatureGeom = firstFeature;
      if(GJV.isFeature(firstFeature)){
        firstFeatureGeom = firstFeature.geometry;
      }
      if(GJV.isPolygon(firstFeatureGeom) || GJV.isMultiPolygon(firstFeatureGeom)){
        geomType = 'polygon';
      }
      else if(GJV.isLineString(firstFeatureGeom) || GJV.isMultiLineString(firstFeatureGeom)){
        geomType = 'line';
      }
      else if(GJV.isPoint(firstFeatureGeom) || GJV.isMultiPoint(firstFeatureGeom)){
        geomType = 'point';
      }
      else {
        log.error("unsupported data type: "+ firstFeatureGeom);
      }

      var srid = '4326'; //assume WGS84 unless we find something else
      if(firstFeature.crs && firstFeature.crs.properties && firstFeature.crs.properties.name){
        srid = firstFeature.crs.properties.name.split(':')[1];
      }
      var cleanedFeatures = [];
      //loop through features
      geoJSON.features.forEach(function(feature){
        //confirm feature is expected type/SRID
        if(feature.crs && feature.crs.properties && feature.crs.properties.name){
          let featureSRID = feature.crs.properties.name.split(':')[1];
          if(srid != featureSRID){
            reject(new Error('SRID mis-match found in geoJSON'));
            return;
          }
        }
        //get unique list of properties
        Object.keys(feature.properties).map(function (key) {
          //remove chars that can't be in database fields (used in PostGIS views)
          key = key.replace("-", "_");
          key = key.replace("'", "''");
          //rename osm_id so it doesn't conflict
          key = key.replace("osm_id", "osm_id_orig");


          if(!uniqueProps.includes(key)){
            uniqueProps.push(key);
          }
          var val = feature.properties[key];
          if(typeof val === 'string'){
            val = val.replace(/\r?\n/g, ' ');
          }
          if(typeof val === 'string' && val.length > 255){
            //trim data to 255 chars
            log.info('trimming string attribute to 255 chars: ' + key);
            //first replace html
            val = val.replace(/<(?:.|\n)*?>/gm, '');
            val = val.substring(0, 254);
          }else if(typeof val === 'object'){
            //stringify nested JSON objects, and limit to 255 chars
            log.info('trimming attribute to 255 chars: ' + key);
            val = JSON.stringify(val).substring(0, 254);
          }
          feature.properties[key] = val;
        });

        if(GJV.isFeature(feature) && feature.geometry){
          cleanedFeatures.push(feature);
        }else{
          log.warn('Skipping invalid GeoJSON feature');
        }

      });

      geoJSON.features = cleanedFeatures;

      var bbox = require('@turf/bbox')(geoJSON);
      debug(bbox);
      geoJSON.bbox = bbox;

      fs.writeFile(uploadtmppath + '.geojson', JSON.stringify(geoJSON), function(err){
        if(err) log.error(err);
        debug('wrote temp geojson to ' + uploadtmppath + '.geojson');
      });

      //now that we know the data type, update the style to clear uneeded default styles
      var style = styles.defaultStyle(layer_id, 'vector', geomType);

      var commands = [
        db('omh.layers').where({
            layer_id
          })
          .update({
              data_type: geomType,
              style,
              extent_bbox: JSON.stringify(bbox)
          })
      ];

      if(update){
        debug('Update temp geojson');
        commands.push(
        db('omh.temp_data').update({
          srid,
          unique_props:JSON.stringify(uniqueProps)})
          .where({layer_id})
        );
      }else{
        commands.push(
          db('omh.temp_data').where({layer_id}).del()
        );
        commands.push(
        db('omh.temp_data').insert({layer_id,
          uploadtmppath,
          srid,
          unique_props:JSON.stringify(uniqueProps)})
        );
      }
      debug('inserting temp geojson into database');
      //insert into the database
      Promise.all(commands)
        .then(function(dbResult){
          if(dbResult){
            var largeData = false;
            if(sizeof(geoJSON) > LARGE_DATA_THRESHOLD){
              largeData = true;
              geoJSON = null;
            }
            result = {
              success: true,
              error: null,
              largeData,
              geoJSON,
              uniqueProps,
              data_type: geomType
            };
            fulfill(result);
          }else{
            reject(new Error("Failed to Insert Data into Database"));
            return;
          }
        })
        .catch(function (err) {
          log.error(err);
          reject(err);
          return;
        });

    }else{
      reject(new Error('Data is not a valid GeoJSON FeatureCollection'));
      return;
    }
  });
  },

  getTempData(layer_id){
    debug('getTempData');
    return knex('omh.temp_data').select('uploadtmppath').where({layer_id})
    .then(function(result){
      return new Promise(function (resolve, reject) {
      fs.readFile(result[0].uploadtmppath + '.geojson', 'utf8', function (err, data) {
        if (err) reject(err);
          var geoJSON = JSON.parse(data);
          resolve(geoJSON);
        });
      });
    });
  },

  loadTempDataToOSM(layer_id, uid, trx){
    //get GeoJSON from temp table
    debug('loading temp data to OSM');
      return this.getTempData(layer_id)
      .then(function(geoJSONData){
        //create a new changeset
        return Changeset.createChangeset(uid, trx)
        .then(function(changeSetResult){
          var changeset_id = changeSetResult[0];
          debug('created changeset: ' + changeset_id);
          var numFeatures = geoJSONData.features.length;
          //by default we only need one interation
          var chunks = 1;
          var chunkSize = numFeatures;

          var dataSize = sizeof(geoJSONData);
          log.info("Data Size: " + dataSize);
          if(dataSize > LARGE_DATA_THRESHOLD){
            chunks = Math.ceil(dataSize / LARGE_DATA_THRESHOLD);
            chunkSize = Math.ceil(numFeatures / chunks);
            log.info('Large Data - chunking data load into ' + chunks + ' chunks of ' + chunkSize + ' features');
          }


          var chunksArr = [];
          for(var i = chunks-1; i >= 0; i--){
            chunksArr.push(i);
          }

          //loop through chunks
          return Promise.map(chunksArr, function(i){
            var start = chunkSize * i;
            debug('chunk: ' + (i+1) + '/' + chunks + ' features: ' + start + ' through ' + (start + chunkSize));
            let osmJSON = geojson2osm(geoJSONData, changeset_id, true, start, chunkSize);

            if(local.writeDebugData){
              fs.writeFile(local.tempFilePath + 'osm-' + i + '.json', JSON.stringify(osmJSON), function(err){
                if(err) {
                  log.error(err);
                  throw err;
                }
              });
            }
            return Changeset.processChangeset(changeset_id, uid, layer_id, osmJSON, trx);

          }, {concurrency: 1})
          .then(function(results){
            var processChangeSetResult = results[results.length-1];
            return Changeset.closeChangeset(changeset_id, trx)
            .then(function(){
              return processChangeSetResult;
            });
          });
        });
      })
      .catch(function (err) {
        log.error(err);
        throw err;
      });
  }
};
