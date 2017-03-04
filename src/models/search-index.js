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
        "mappings": {
          "feature": {
            "properties": {
              "location": {
                "type": "geo_point"
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
        var updateCommands = [];
        if(!layer.is_external && !layer.remote){
          log.info('Adding layer: ' + layer.layer_id);
          commands.push(knex(`layers.data_${layer.layer_id}`).select('mhid')
          .then(mhidResults =>{
            log.info('updating ' + mhidResults.length + ' features');
            mhidResults.forEach(mhidResult =>{
              updateCommands.push(_this.updateFeature(layer.layer_id, mhidResult.mhid, false));
            });
            return Promise.all(updateCommands);
          }));
        }
      }); 
      return Promise.all(commands);
    });
  },

  updateFeature(layer_id: number, mhid: string, refreshImmediately: boolean = true){
    
    return Feature.getFeatureByID(mhid, layer_id)
    .then(result => {

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
          notes: result.feature.notes,
          published: true,
        }
      });
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
        }
      }
    ).then(results => {
      if(results && results.hits && results.hits.hits){
        return results.hits.hits;
      }
      return null;
    });
  },

  updateLayer(){

  },

  updateStory(){

  },

  updateMap(){

  },

  updateHub(){

  }

}