var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../../actions/map/MarkerActions');
var debug = require('../services/debug')('stores/MarkerStore');

/**
 * A store to hold marker objects so we can update them later
 */
module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return {
      markers: {}
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

  addMarker(layer_id, mhid, marker){
    if(!this.state.markers[layer_id]){
      this.state.markers[layer_id] = {};
    }
    this.state.markers[layer_id][mhid] = marker;
  },

  removeMarker(layer_id, mhid){
    if(this.state.markers[layer_id]){
      delete this.state.markers[layer_id][mhid];
    }
  },

  removeLayer(layer_id){
    if(this.state.markers[layer_id]){
      delete this.state.markers[layer_id];
    }
  },

  getMarker(layer_id, mhid, cb){
    if(this.state.markers[layer_id]){
      cb(this.state.markers[layer_id][mhid]);
    }else{
      cb();
    }
  }

  });