//@flow

var client = require('../services/elasticsearch').getClient();
var Feature = require('../models/feature');
var Layer = require('../models/layer');
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

  rebuildFeatures(){
    var _this = this;
    //delete all existing features
    return Layer.getAllLayers()
    .then(layers => {
      var commands = [];
      layers.forEach(layer =>{
        if(!layer.is_external && !layer.remote){
         commands.push(_this.updateLayer(layer));
        }
      }); 
      return Promise.all(commands);
    });
  },

  updateLayer(layer_id: number, trx: any){
    var _this = this;
    let db = knex; if(trx){db = trx;}
    var updateCommands = [];

    log.info('Adding layer in search index: ' + layer_id);
    return db(`layers.data_${layer_id}`).select('mhid')
    .then(mhidResults =>{
      log.info('updating ' + mhidResults.length + ' features');
      mhidResults.forEach(mhidResult =>{
        updateCommands.push(_this.updateFeature(layer_id, mhidResult.mhid, false, trx));
      });
      return Promise.all(updateCommands);
    });
  },


  deleteLayer(layer_id: number, trx: any){
    var _this = this;
    let db = knex; if(trx){db = trx;}
    var deleteCommands = [];

    log.info('Deleting layer form search index: ' + layer_id);
    return db(`layers.data_${layer_id}`).select('mhid')
    .then(mhidResults =>{
      log.info('deleting ' + mhidResults.length + ' features');
      mhidResults.forEach(mhidResult =>{
        deleteCommands.push(_this.deleteFeature(mhidResult.mhid));
      }).catch(err =>{
        log.error(err);
      });
      return Promise.all(deleteCommands);
    });
  },

  updateFeature(layer_id: number, mhid: string, refreshImmediately: boolean = true, trx: any){
    
    return Feature.getFeatureByID(mhid, layer_id, trx)
    .then(result => {

      //HACK: elasticsearch doesn't like null or improperly formatted fields called 'timestamp';
      delete result.feature.geojson.features[0].properties.timestamp;

      var centroid = _centroid(result.feature.geojson);

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
          properties: result.feature.geojson.features[0].properties,
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