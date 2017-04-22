import Reflux from 'reflux';
import Actions from '../actions/MapActions';
var debug = require('../services/debug')('stores/map-store');
var findIndex = require('lodash.findindex');
var forEachRight = require('lodash.foreachright');
var $ = require('jquery');

export default class LocaleStore extends Reflux.Store {

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(){
    return {
      style: {},
      position: {},
      basemap: 'default',
      layers: []
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug('store updated');
  }

 toggleVisibility(layer_id, cb){
   var layers = this.state.layers;
   var index = findIndex(layers, {layer_id});

   if(layers[index].settings.active){
     layers[index].settings.active = false;
   }else {
     layers[index].settings.active = true;
   }

   this.updateMap(layers);
   cb();
 }

 updateLayers(layers, update=true){
   this.setState({layers});
   if(update){
    this.updateMap(layers);
   }  
 }

 updateMap(layers){
   var style = this.buildMapStyle(layers);
   this.setState({layers, style});
 }

 changeBaseMap(basemap){
  this.setState({basemap});
 }

 buildMapStyle(layers){
   var mapStyle = {
     sources: {},
     layers: []
   };

   //reverse the order for the styles, since the map draws them in the order recieved
   forEachRight(layers, function(layer){
     var style = layer.style;
     if(style && style.sources && style.layers){
       //check for active flag and update visibility in style
       if(layer.settings.active != undefined && layer.settings.active == false){
         //hide style layers for this layer
         style.layers.forEach(function(styleLayer){
           styleLayer['layout'] = {
             "visibility": "none"
           };
         });
       } else {
         //reset all the style layers to visible
         style.layers.forEach(function(styleLayer){
           styleLayer['layout'] = {
             "visibility": "visible"
           };
         });
       }
       //add source
       $.extend(mapStyle.sources, style.sources);
       //add layers
       mapStyle.layers = mapStyle.layers.concat(style.layers);
     } else {
       debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
     }
   });
   return mapStyle;
 }
}