// @flow
var knex = require('../connection.js');
var GJV = require("geojson-validation");
var log = require('./log');
var local = require('../local');
var debug = require('./debug')('data-load-utils');
//var geojson2osm = require('./geojson_to_macrocosm');
//var Changeset = require('./changeset');
var fs = require('fs');
//var XML = require('./xml');
var LayerViews = require('./layer-views');
var Promise = require('bluebird');
var sizeof = require('object-sizeof');
var MapStyles = require('../components/Map/Styles');
//var fileEncodingUtils = require('./file-encoding-utils');
var ogr2ogr = require('ogr2ogr');
var SearchIndex = require('../models/search-index');

const LARGE_DATA_THRESHOLD = 20000000;
//const FEATURE_CHUNK_SIZE = 1000; 

module.exports = {

  removeLayerData(layer_id: number, trx: any = null){
    debug('removeLayerData');
    let db = knex;
    if(trx){db = trx;}
    //remove views
    return db('omh.layers').select('status').where({layer_id}).then(result =>{
      let status = result[0].status;
      if(status === 'published ' || status === 'loaded'){
        return SearchIndex.deleteLayer(layer_id, trx)
      .then(()=>{
        return LayerViews.dropLayerViews(layer_id, trx).then(()=>{
          //delete data from OSM
        return db.raw(`DROP TABLE layers.data_${layer_id};`);
        });
      });
      }else{
        return null;
      }     
    });
  },

  storeTempShapeUpload(uploadtmppath: string, layer_id: number, trx: any = null){
    debug('storeTempShapeUpload');
    let db = knex;
    if(trx){db = trx;}
    return db('omh.temp_data').where({layer_id}).del()
    .then(() => {
      return db('omh.temp_data').insert({
        layer_id,
        uploadtmppath
      });
    });
  },

  getTempShapeUpload(layer_id: number, trx: any = null){
    debug('getTempShapeUpload');
    let db = knex;
    if(trx){db = trx;}
    return db('omh.temp_data').where({layer_id})
    .then((result) => {
      return result[0].uploadtmppath;
    });
  },

  storeTempGeoJSON(geoJSON: any, uploadtmppath: string, layer_id: number, update: boolean, trx: any = null){
    debug('storeTempGeoJSON');
    let db = knex;
    if(trx){db = trx;}
    return new Promise((fulfill, reject) => {
    var result = {success: false, error: 'Unknown Error'};
    var uniqueProps = [];

    if(!geoJSON){
      reject(new Error("Error dataset missing."));
      return;
    }
    //confirm that it is a feature collection
    if(geoJSON.type === "FeatureCollection"){

      //Error if the FeatureCollection is empty
      if(!geoJSON.features || geoJSON.features.length === 0){
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
      geoJSON.features.map((feature, i) => {
        //confirm feature is expected type/SRID
        if(feature.crs && feature.crs.properties && feature.crs.properties.name){
          let featureSRID = feature.crs.properties.name.split(':')[1];
          if(srid !== featureSRID){
            reject(new Error('SRID mis-match found in geoJSON'));
            return;
          }
        }
        //get unique list of properties
        var cleanedFeatureProps = {};
        Object.keys(feature.properties).map((key) => {
          //remove chars that can't be in database fields (used in PostGIS views)         
          var val = feature.properties[key];
          
          key = key.replace("-", "_");
          key = key.replace("'", "''");
          
          if(!uniqueProps.includes(key)){
            uniqueProps.push(key);
          }
          
          if(typeof val === 'string'){
            val = val.replace(/\r?\n/g, ' ');
          }

          if(typeof val === 'object'){
            //log.info('converting nested object to string: ' + key);
            val = JSON.stringify(val);
          }
          
          cleanedFeatureProps[key] = val;
        });

        let mhid = `${layer_id}:${i+1}`;
        feature.properties = {
          mhid,
          tags: JSON.stringify(cleanedFeatureProps)
        };

        if(GJV.isFeature(feature) && feature.geometry){
          cleanedFeatures.push(feature);
        }else{
          log.warn('Skipping invalid GeoJSON feature');
        }

      });

      geoJSON.features = cleanedFeatures;

      var bbox;
      if(geoJSON.features.length === 1 && geoJSON.features[0].geometry.type === 'Point'){
        //buffer the Point
        var buffered = require('@turf/buffer')(geoJSON.features[0], 500, 'meters');
        bbox = require('@turf/bbox')(buffered);
      }else{
        bbox = require('@turf/bbox')(geoJSON);
      }


      debug(bbox);
      geoJSON.bbox = bbox;


    

      //now that we know the data type, update the style to clear uneeded default styles
      var style = MapStyles.style.defaultStyle(layer_id, 'vector', geomType);

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

      if(local.writeDebugData){
        fs.writeFile(uploadtmppath + '.geojson', JSON.stringify(geoJSON), (err) => {
          if(err) log.error(err);
          debug('wrote temp geojson to ' + uploadtmppath + '.geojson');
        });
        }
           
        var ogr = ogr2ogr(geoJSON).format('PostgreSQL')
      .skipfailures()
      .options(['-t_srs', 'EPSG:4326', '-nln', `layers.temp_${layer_id}` ])
      .destination(`PG:host=${local.database.host} user=${local.database.user} dbname=${local.database.database} password=${local.database.password}`)
      .timeout(1200000);
      ogr.exec((er) => {
        if (er){
          log.error(er);
          reject(new Error("Failed to Insert Data into Temp POSTGIS Table"));
        }else{

      log.info('uniqueProps: ' + JSON.stringify(uniqueProps));    
      
      debug('inserting temp geojson into database');
      //insert into the database
      Promise.all(commands)
        .then((dbResult) => {
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
            reject(new Error("Failed to Insert Metadata Database"));
            return;
          }
        })
        .catch((err) => {
          log.error(err);
          reject(err);
          return;
        });

          }
      });

    }else{
      reject(new Error('Data is not a valid GeoJSON FeatureCollection'));
      return;
    }
  });
  },

  createEmptyDataTable(layer_id: number, trx: any){
     return trx.raw(`CREATE TABLE layers.data_${layer_id}
     (
       mhid text, 
       wkb_geometry geometry(Geometry, 4326),
       tags jsonb
     )`).then(()=>{
        return trx.raw(`ALTER TABLE layers.data_${layer_id} ADD PRIMARY KEY (mhid);`)
        .then(()=>{
          return trx.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
            ON layers.data_${layer_id}
            USING gist
            (wkb_geometry);`)
          .then(()=>{
              return trx.raw(`CREATE SEQUENCE layers.mhid_seq_${layer_id} START 1`);
            });
        });
    });
  },

  loadTempData(layer_id: number, trx: any){

    return trx.raw(`CREATE TABLE layers.data_${layer_id} AS 
      SELECT mhid, wkb_geometry, tags::jsonb FROM layers.temp_${layer_id};`)
      .then(()=>{
        return trx.raw(`ALTER TABLE layers.data_${layer_id} ADD PRIMARY KEY (mhid);`)
        .then(()=>{
          return trx.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
            ON layers.data_${layer_id}
            USING gist
            (wkb_geometry);`)
          .then(()=>{
            return trx.raw(`DROP TABLE layers.temp_${layer_id};`)
            .then(()=>{
              return trx.raw(`SELECT count(*) as cnt FROM layers.data_${layer_id};`)
              .then(result =>{
                var maxVal = parseInt(result.rows[0].cnt) + 1;
                debug('creating sequence starting at: ' + maxVal);
                return trx.raw(`CREATE SEQUENCE layers.mhid_seq_${layer_id} START ${maxVal}`)
                .then(()=>{
                  return SearchIndex.updateLayer(layer_id, trx).then(()=>{
                    return trx('omh.layers').update({status: 'loaded'}).where({layer_id});
                  });
                });                                
              });       
            });       
          });
        });
      });
  }
};
