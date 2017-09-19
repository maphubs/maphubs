//@flow
var debug = require('../../../services/debug')('Map/DataEditorMixin');
import DataEditorActions from '../../../actions/DataEditorActions';
var $ = require('jquery');
//var _assignIn = require('lodash.assignin');
//import Reflux from 'reflux';
var MapboxDraw = {};
if (typeof window !== 'undefined') {
    MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js');
}

import type {Layer} from '../../../stores/layer-store';

import theme from '@mapbox/mapbox-gl-draw/src/lib/theme';

module.exports = {

  getFirstDrawLayerID(){
    return this.getEditorStyles()[0].id + '.cold';
  },

  getEditorStyles(){

    return theme;

  },

  editFeature(feature: Object){
    //get the feature from the database, since features from vector tiles can be incomplete or simplified
    DataEditorActions.selectFeature(feature.properties.mhid, feature =>{      
      if(this.draw){
      if(!this.draw.get(feature.id)){
        //if not already editing this feature
        this.draw.add(feature);
        this.updateMapLayerFilters();
      }
      
    }
    });
  },

  startEditingTool(layer: Layer){
    
    var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: layer.data_type === 'point',
        polygon: layer.data_type === 'polygon',
        line_string: layer.data_type === 'line',
        trash: true
    },
    styles: this.getEditorStyles()
    });
    this.draw = draw;


    $('.mapboxgl-ctrl-top-right').addClass('mapboxgl-ctrl-maphubs-edit-tool');
    $('.map-search-button').addClass('maphubs-edit-tool-search-button');
    
    this.map.addControl(draw, 'top-right');

    this.map.on('draw.create', e => {
      debug.log('draw create');
      var features = e.features;
      if(features && features.length > 0){
        features.forEach( feature => {
          DataEditorActions.createFeature(feature);
        });
      }

    });

    this.map.on('draw.update', e =>{
      debug.log('draw update');
      this.updateEdits(e);
      
    });

     this.map.on('draw.delete', e =>{
       debug.log('draw delete');
      var features = e.features;
      if(features && features.length > 0){
        features.forEach(feature => {
          DataEditorActions.deleteFeature(feature);
        });
      }
    });

     this.map.on('draw.selectionchange', e => {
       debug.log('draw selection');
       //if in simple mode (e.g. not selecting vertices) then check if selected feature changed
       var mode = this.draw.getMode();
       if(mode === 'simple_select'){
        var features = e.features;
        if(features && features.length > 0){
          features.forEach(feature => {
            DataEditorActions.selectFeature(feature.id, ()=>{});
          });
        }
       }
    });
  },

  stopEditingTool(){   
    $('.mapboxgl-ctrl-top-right').removeClass('mapboxgl-ctrl-maphubs-edit-tool');
    $('.map-search-button').removeClass('maphubs-edit-tool-search-button');
    this.map.removeControl(this.draw);
    this.removeMapLayerFilters();
    this.reloadEditingSourceCache();
    this.reloadStyle();
  },

  

  updateEdits(e: any){
     if (e.features.length > 0) {
      DataEditorActions.updateFeatures(e.features);
     }
  },

  /**
   * Triggered when the store updates a feature
   * 
   * @param {string} type
   * @param {any} feature 
  
   * 
   */
  onFeatureUpdate(type: string, feature: Object){
    if(this.draw){
      if(type === 'update' || type === 'create'){
        this.draw.add(feature.geojson);
      }else if(type === 'delete'){
        this.draw.delete(feature.geojson.id);
      }
    }
  },
  

  /**
   * Add filter to hide vector tile versions of features active in the drawing tool
   * 
   */
  updateMapLayerFilters(){

    var layer_id = this.state.editingLayer.layer_id;
    var shortid = this.state.editingLayer.shortid;

    //build a new filter
    var uniqueIds = [];

    this.state.edits.forEach(edit =>{
      var mhid = edit.geojson.id;
      if(mhid && !uniqueIds.includes(mhid)){
        uniqueIds.push(mhid);
      }
    });

    this.state.originals.forEach(orig =>{
      var mhid = orig.geojson.id;
      if(mhid && !uniqueIds.includes(mhid)){
        uniqueIds.push(mhid);
      }
    });

    var hideEditingFilter = ['!in', 'mhid'].concat(uniqueIds);

    if(this.overlayMapStyle){
      this.overlayMapStyle.layers.forEach(layer => {

        //check if the layer_id matches
        var foundMatch;
        if(layer.metadata && layer.metadata['maphubs:layer_id']){
          if(layer.metadata['maphubs:layer_id'] === layer_id){
            foundMatch = true;
          }
        }else if(layer.id.endsWith(shortid)){
          foundMatch = true;
        }
        if(foundMatch){
          //get current filter
          var filter = layer.filter;
          if(!filter || !Array.isArray(filter) || filter.length === 0 ){
            //create a new filter
            filter = hideEditingFilter;
          }else if(filter[0] === "all"){
            //add our condition to the end
            filter = layer.filter.concat(hideEditingFilter);
          }else{
            filter = ["all", filter, hideEditingFilter];
          }
           this.map.setFilter(layer.id, filter);
        }

      });
    }
  },

  removeMapLayerFilters(){

    var layer_id = this.state.editingLayer.layer_id;


    if(this.glStyle){
      this.glStyle.layers.forEach(layer => {

        //check if the layer_id matches
        var foundMatch;
        if(layer.metadata && layer.metadata['maphubs:layer_id']){
          if(layer.metadata['maphubs:layer_id'] === layer_id){
            foundMatch = true;
          }
        }else if(layer.id.endsWith(layer_id)){
          foundMatch = true;
        }
        if(foundMatch){
          //get current filter
          var filter = layer.filter;
          if(!filter || !Array.isArray(filter) || filter.length === 0 ){
            //do nothing
          }else if(filter[0] === "all"){
            //remove our filter from the end
             filter = layer.filter.pop();
          }else{
            filter = undefined;
          }
           this.map.setFilter(layer.id, filter);
        }

      });
    }

  },

  reloadEditingSourceCache(){
    var sourceID = Object.keys(this.state.editingLayer.style.sources)[0];
    const sourceCache = this.map.style.sourceCaches[sourceID];
    sourceCache.reload();
  }

};