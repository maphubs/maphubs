//@flow

var client = require('../services/elasticsearch').getClient();
var Feature = require('../models/feature');
var local = require('../local');
var log = require('../services/log');
var _centroid = require('@turf/centroid');
var knex = require('../connection.js');
var Promise = require('bluebird');

module.exports = {

  
  searchIndexName: local.elasticSearchIndexName ? local.elasticSearchIndexName : 'maphubs',
  
  /**
  * Delete an existing index
  */
  deleteIndex() {  
    return client.indices.delete({
        index: this.searchIndexName
    });
  },

  /**
  * create the index
  */
  initIndex() {  
    return client.indices.create({
        "index": this.searchIndexName, 
        "body": {
          "mappings": {
            "feature": {
              "properties": {
                "location": {
                  "type": "geo_point"
                }
              }
            }
          }   
        }     
    });
  },

  /**
  * check if the index exists
  */
  indexExists() {  
    return client.indices.exists({
        index: this.searchIndexName
    });
  },

  rebuildFeatures(trx: any){  
    var _this = this;
    let db = knex;
    if(trx){db = trx;}
    //delete all existing features
    return db('omh.layers').select('layer_id').whereNot({
      is_external: true, remote: true, private: true, features_indexed: true
    })
    .then(layers => {
      return Promise.mapSeries(layers, layer => {
       return _this.updateLayer(layer.layer_id, trx)
       .then(()=>{
          return db('omh.layers')
          .update({features_indexed: true})
          .where({layer_id: layer.layer_id});
        }).catch(err =>{
          log.error(err);
        });
      });
    });
  },

  updateLayer(layer_id: number, trx: any){
    var _this = this;
    let db = knex; if(trx){db = trx;}

    log.info('Adding layer in search index: ' + layer_id);
    return db(`layers.data_${layer_id}`).select('mhid')
    .then(mhidResults =>{
      log.info('updating ' + mhidResults.length + ' features');
      return Promise.mapSeries(mhidResults, mhidResult => {
        return _this.updateFeature(layer_id, mhidResult.mhid, false, trx);
      });
    });
  },


  deleteLayer(layer_id: number, trx: any){
    var _this = this;
    let db = knex; if(trx){db = trx;}

    log.info('Deleting layer form search index: ' + layer_id);
    return db(`layers.data_${layer_id}`).select('mhid')
    .then(mhidResults =>{
      log.info('deleting ' + mhidResults.length + ' features');
      return Promise.mapSeries(mhidResults, mhidResult => {
        return _this.deleteFeature(mhidResult.mhid);
      }).catch(err =>{
        log.error(err);
      });
    });
  },

  updateFeature(layer_id: number, mhid: string, refreshImmediately: boolean = true, trx: any): Bluebird$Promise<Object>{
    
    return Feature.getFeatureByID(mhid, layer_id, trx)
    .then(result => {

      let feature = result.feature.geojson.features[0];

      //HACK: elasticsearch doesn't like null or improperly formatted fields called 'timestamp';
      delete feature.properties.timestamp;

      var centroid;
      if(feature.geometry.type === 'Point'){
        centroid = feature;
      }else{
        centroid = _centroid(result.feature.geojson);
      }

      //convert props to array
      let props = Object.keys(feature.properties).map(key => {
        let val = JSON.stringify(feature.properties[key]);
        return {key, val};
      });

      //update feature
       return client.index({
        index: this.searchIndexName,
        type: 'feature',
        id: mhid,
        refresh: refreshImmediately,
        body: {
          layer_id: layer_id,
          mhid,
          location: {
            lat: centroid.geometry.coordinates[1],
            lon: centroid.geometry.coordinates[0]
          },
          properties: props,
          notes: result.notes,
          published: true,
          timeout: '60s'
        }
      }).catch(err =>{
        log.error(err);
      });
    });

  },

  deleteFeature(mhid: string){
    return client.delete({
      index: this.searchIndexName,
      type: 'feature',
      id: mhid,
      timeout: '60s'
    }).catch(err =>{
      log.error(err);
    });
  },

  queryFeatures(query: string){
    return client.search(
      {
        index: this.searchIndexName,
        type: 'feature',
        size: 1000,
        body: {
          query: {
           "query_string": {
              "query": query + '*'
            }
          }
        },
        timeout: '60s'
      }
    ).then(results => {
      if(results && results.hits && results.hits.hits){
        return results.hits.hits;
      }
      return null;
    });
  },

  updateStory(){

  },

  updateMap(){

  },

  updateHub(){

  }

};