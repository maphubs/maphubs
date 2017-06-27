import Reflux from 'reflux';
import Actions from '../../actions/map/MarkerActions';
var debug = require('../../services/debug')('stores/MarkerStore');

/**
 * A store to hold marker objects so we can update them later
 */
export default class MarkerStore extends Reflux.Store {

  constructor(){
    super();
    this.state = {
      markers: {}
    };
    this.listenables = Actions;
  }

  reset(){
    this.setState({
      markers: {}
    });
  }

  storeDidUpdate(){
    debug.log('store updated');
  }

  addMarker(layer_id, mhid, marker){
    var featureId = mhid.split(':')[1];
    if(!this.state.markers[layer_id]){
      this.state.markers[layer_id] = {};
    }
    this.state.markers[layer_id][featureId] = marker;
  }

  removeMarker(layer_id, mhid){
    var featureId = mhid.split(':')[1];
    if(this.state.markers[layer_id]){
      delete this.state.markers[layer_id][featureId];
    }
  }

  removeLayer(layer_id){
    if(this.state.markers[layer_id]){
      delete this.state.markers[layer_id];
    }
  }

  getMarker(layer_id, mhid, cb){
    var featureId = mhid.split(':')[1];
    if(this.state.markers[layer_id]){
      cb(this.state.markers[layer_id][featureId]);
    }else{
      cb();
    }
  }
}