//@flow
import Reflux from 'reflux';
import Actions from '../actions/MapActions';
var MapStyleHelper = require('./map/MapStyleHelper');
var debug = require('../services/debug')('stores/map-store');
var findIndex = require('lodash.findindex');

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
    this.updateMap(layers);
   }else{
      debug('Map layer missing settings object: ' + layer_id);
    }
   
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
  return MapStyleHelper.buildMapStyle(layers);
 }

}