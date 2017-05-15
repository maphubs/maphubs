//@flow
import Reflux from 'reflux';
import Actions from '../actions/MapActions';
var debug = require('../services/debug')('stores/map-store');
var findIndex = require('lodash.findindex');
var forEachRight = require('lodash.foreachright');
var $ = require('jquery');

import type {Layer} from './layer-store';

export type MapStoreState = {
   style: Object,
  position: Object,
  basemap: string,
  layers: Array<Layer>
}

export default class MapStore extends Reflux.Store {

  state: MapStoreState

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(): MapStoreState{
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

 toggleVisibility(layer_id: number, cb: Function){
   var layers = this.state.layers;
   var index = findIndex(layers, {layer_id});
   if(layers[index] && layers[index].settings){
    if(layers[index].settings.active){
     layers[index].settings.active = false;
    }else {
      layers[index].settings.active = true;
    }
   }
   
   this.updateMap(layers);
   cb();
 }

 updateLayers(layers: Array<Layer>, update: boolean=true){
   this.setState({layers});
   if(update){
    this.updateMap(layers);
   }  
 }

 updateMap(layers: Array<Layer>){
   var style = this.buildMapStyle(layers);
   this.setState({layers, style});
 }

 changeBaseMap(basemap: string){
  this.setState({basemap});
 }

 buildMapStyle(layers: Array<Layer>){
   var mapStyle = {
     sources: {},
     layers: []
   };

   //reverse the order for the styles, since the map draws them in the order recieved
   forEachRight(layers, (layer) => {
     var style = layer.style;
     if(style && style.sources && style.layers){
       //check for active flag and update visibility in style
       if(layer.settings && typeof layer.settings.active !== 'undefined' && layer.settings.active === false){
         //hide style layers for this layer
         style.layers.forEach((styleLayer) => {
           styleLayer['layout'] = {
             "visibility": "none"
           };
         });
       } else {
         //reset all the style layers to visible
         style.layers.forEach((styleLayer) => {
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