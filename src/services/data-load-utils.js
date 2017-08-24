// @flow
var knex = require('../connection.js');
var GJV = require("geojson-validation");
var log = require('./log');
var local = require('../local');
var debug = require('./debug')('data-load-utils');
var fs = require('fs');
var LayerViews = require('./layer-views');
var Promise = require('bluebird');
var sizeof = require('object-sizeof');
var MapStyles = require('../components/Map/Styles');
var ogr2ogr = require('ogr2ogr');
var SearchIndex = require('../models/search-index');
const LARGE_DATA_THRESHOLD = 20000000;

module.exports = {

  async removeLayerData(layer_id: number, trx: any = null){
    debug.log('removeLayerData');
    let db = knex;
    if(trx){db = trx;}
    //remove views
    const result = await db('omh.layers').select('status').where({layer_id});
    
    if(result && result.length > 0){
      let status = result[0].status;
      if(status === 'published' || status === 'loaded'){
        debug.log('removing from search index');
        await SearchIndex.deleteLayer(layer_id, trx);
        debug.log('dropping layer views');
        await LayerViews.dropLayerViews(layer_id, trx);
        debug.log('dropping layer data');
        await db.raw(`DROP TABLE layers.data_${layer_id};`);
        debug.log('dropping layer sequence');
        return db.raw(`DROP SEQUENCE layers.mhid_seq_${layer_id};`);
      }else{
        return null;
      }
    }else{
      return null;
    }    

  },

  async storeTempShapeUpload(uploadtmppath: string, layer_id: number, trx: any = null){
    debug.log('storeTempShapeUpload');
    let db = knex;
    if(trx){db = trx;}
    await db('omh.temp_data').where({layer_id}).del();
    return db('omh.temp_data').insert({
        layer_id,
        uploadtmppath
      });
  },

  async getTempShapeUpload(layer_id: number, trx: any = null){
    debug.log('getTempShapeUpload');
    let db = knex;
    if(trx){db = trx;}
    const result = await db('omh.temp_data').where({layer_id});
    return result[0].uploadtmppath;
  },

  cleanProps(props: Object, uniqueProps: Object){
    //get unique list of properties
    var cleanedFeatureProps = {};
    Object.keys(props).map((key) => {
      //remove chars that can't be in database fields (used in PostGIS views)         
      var val = props[key];
      
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
    return cleanedFeatureProps;
  },

  async insertTempGeoJSONIntoDB(geoJSON: any, layer_id: number){ 
    var ogr = ogr2ogr(geoJSON).format('PostgreSQL')
    .skipfailures()
    .options(['-t_srs', 'EPSG:4326', '-nln', `layers.temp_${layer_id}` ])
    .destination(`PG:host=${local.database.host} user=${local.database.user} dbname=${local.database.database} password=${local.database.password}`)
    .timeout(1200000);
    return Promise.promisify(ogr.exec, {context: ogr})();
  },

  async storeTempGeoJSON(geoJSON: any, uploadtmppath: string, layer_id: number, shortid: string, update: boolean, setStyle: boolean, trx: any = null){
    var _this = this;
    debug.log('storeTempGeoJSON');
    let db = trx ? trx : knex;

    var result = {success: false, error: 'Unknown Error'};
    var uniqueProps = [];

    if(!geoJSON){
      throw new Error("Error dataset missing.");
    }
    //confirm that it is a feature collection
    if(geoJSON.type === "FeatureCollection"){

      //Error if the FeatureCollection is empty
      if(!geoJSON.features || geoJSON.features.length === 0){
        throw new Error("Dataset appears to be empty. Zero features found in FeatureCollection");
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
            throw new Error('SRID mis-match found in geoJSON');
          }
        }
        //get unique list of properties
        var cleanedFeatureProps = _this.cleanProps(feature.properties, uniqueProps);

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

      debug.log(bbox);
      geoJSON.bbox = bbox;

      let updateData = {
          data_type: geomType,
          extent_bbox: JSON.stringify(bbox)
      };

      if(setStyle){
         //now that we know the data type, update the style to clear uneeded default styles
        var style = MapStyles.style.defaultStyle(layer_id, shortid, 'vector', geomType);
        updateData.style = style;
      }
     
      if(local.writeDebugData){
        /*eslint-disable security/detect-non-literal-fs-filename*/
        //temp file path is build using env var + GUID, not user input
        fs.writeFile(uploadtmppath + '.geojson', JSON.stringify(geoJSON), (err) => {
          if(err) log.error(err);
          debug.log('wrote temp geojson to ' + uploadtmppath + '.geojson');
        });
      }
      try{
        await _this.insertTempGeoJSONIntoDB(geoJSON, layer_id);
      }catch(err){
        log.error(err);
        throw new Error("Failed to Insert Data into Temp POSTGIS Table");
      }
           
      log.info('uniqueProps: ' + JSON.stringify(uniqueProps));          
      debug.log('inserting temp geojson into database');
      //insert into the database
      await db('omh.layers').where({layer_id}).update(updateData);
      
      if(update){
        debug.log('Update temp geojson');
        await db('omh.temp_data').update({
          srid,
          unique_props:JSON.stringify(uniqueProps)})
          .where({layer_id});

      }else{ //delete and replace
        await db('omh.temp_data').where({layer_id}).del();
        await db('omh.temp_data').insert({layer_id,
          uploadtmppath,
          srid,
          unique_props:JSON.stringify(uniqueProps)});
      }

      debug.log('db updates complete');
      var largeData = false;
      let size = sizeof(geoJSON);
      debug.log(`GeoJSON size: ${size}`);
      if(size > LARGE_DATA_THRESHOLD){
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
      debug.log('Upload Complete!');
      return result;
    }else{
      throw new Error('Data is not a valid GeoJSON FeatureCollection');
    }
  },

  async createEmptyDataTable(layer_id: number, trx: any){
    await trx.raw(`CREATE TABLE layers.data_${layer_id}
     (
       mhid text, 
       wkb_geometry geometry(Geometry, 4326),
       tags jsonb
     )`);
    await trx.raw(`ALTER TABLE layers.data_${layer_id} ADD PRIMARY KEY (mhid);`);
    await trx.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
      ON layers.data_${layer_id}
      USING gist
      (wkb_geometry);`);
    return trx.raw(`CREATE SEQUENCE layers.mhid_seq_${layer_id} START 1`);
  },

  async loadTempData(layer_id: number, trx: any){
    debug.log('loadTempData');
    //create data table
    await trx.raw(`CREATE TABLE layers.data_${layer_id} AS 
      SELECT mhid, wkb_geometry, tags::jsonb FROM layers.temp_${layer_id};`);
    //set mhid as primary key
    await trx.raw(`ALTER TABLE layers.data_${layer_id} ADD PRIMARY KEY (mhid);`);
    //create index
    await trx.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
                    ON layers.data_${layer_id}
                    USING gist
                    (wkb_geometry);`);
    //drop temp data
    await trx.raw(`DROP TABLE layers.temp_${layer_id};`);

    //get count and create sequence
    const result = await trx.raw(`SELECT count(*) as cnt FROM layers.data_${layer_id};`);  
    var maxVal = parseInt(result.rows[0].cnt) + 1;
    debug.log('creating sequence starting at: ' + maxVal);
    await trx.raw(`CREATE SEQUENCE layers.mhid_seq_${layer_id} START ${maxVal}`);
    
    //update search index
    await SearchIndex.updateLayer(layer_id, trx);

    return trx('omh.layers').update({status: 'loaded'}).where({layer_id});        
  }
};