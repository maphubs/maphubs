//@flow
import Reflux from 'reflux';
import Actions from '../actions/MapMakerActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/MapMakerStore');
var _findIndex = require('lodash.findindex');
var _reject = require('lodash.reject');
var _find = require('lodash.find');
var MapStyles = require('../components/Map/Styles');
//var $ = require('jquery');
//var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;
import type {Layer} from './layer-store';

export type MapMakerStoreState = {
   map_id?: number,
  title?: LocalizedString,
  mapLayers?: Array<Layer>,
  mapStyle?: Object,
  position?: Object,
  settings?: Object,
  isPrivate?: boolean,
  owned_by_group_id?: string,
  basemap?: string,
  editingLayer?: boolean
}

export default class MapMakerStore extends Reflux.Store  {

  state: MapMakerStoreState

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(): MapMakerStoreState{
    return {
      map_id: -1,
      mapLayers: [],
      settings: {},
      mapStyle: {},
      position: {},
      isPrivate: false,
      basemap: 'default',
      editingLayer: false
    };
  }

  reset(){
    this.setState(this.getDefaultState());
    if(this.state.mapLayers){
      this.updateMap(this.state.mapLayers);
    }  
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners

  setMapLayers(mapLayers: Array<Layer>, update: boolean=true){
    this.setState({mapLayers});
    if(update){
      this.updateMap(mapLayers);
    } 
  }

  setMapId(map_id: number){
    this.setState({map_id});
  }

  setMapTitle(title: LocalizedString){
    Object.keys(title).forEach(key =>{
      title[key] = title[key].trim();
    });
    this.setState({title});
  }

  setPrivate(isPrivate: boolean){
    this.setState({isPrivate});
  }

  setOwnedByGroupId(group_id: string){
    this.setState({owned_by_group_id: group_id});
  }

  setMapPosition(position: Object){
    this.setState({position});
  }

  setMapBasemap(basemap: string){
    this.setState({basemap});
  }

  setSettings(settings: Object){
    this.setState({settings});
  }

  addToMap(layer: Layer, cb: Function){
    //check if the map already has this layer
    if(_find(this.state.mapLayers, {layer_id: layer.layer_id})){
      cb(true);
    }else{
      //tell the map to make this layer visible
      MapStyles.settings.set(layer.style, 'active', true);
    
      var layers = this.state.mapLayers;
      if(layers){
        layers.push(layer);
        this.updateMap(layers);
      }
      cb();
    }
  }

  removeFromMap(layer: Layer){
    var layers = _reject(this.state.mapLayers, {'layer_id': layer.layer_id});
    this.updateMap(layers);
  }

  toggleVisibility(layer_id: number, cb: Function){
    let mapLayers = this.state.mapLayers;
    let index = _findIndex(mapLayers, {layer_id});
    if(mapLayers){
      let layer = mapLayers[index];
      let active = MapStyles.settings.get(layer.style, 'active');

      if(active){
        MapStyles.settings.set(layer.style, 'active', false);
        active = false;      
      }else {
        MapStyles.settings.set(layer.style, 'active', true);
        active = true;
      }

      if(layer && layer.style && layer.style.layers){
         layer.style.layers.forEach((styleLayer) => {
          if(!styleLayer.layout){
            styleLayer.layout = {};       
          }
          if(active){
            styleLayer.layout.visibility = 'visible';
          }else{
            styleLayer.layout.visibility = 'none';
          }
        });
      }
     
      this.updateMap(mapLayers);
    }
    cb();
  }

  updateLayerStyle(layer_id: number, style: Object, labels: Object, legend: string){
    var index = _findIndex(this.state.mapLayers, {layer_id});
    var layers = this.state.mapLayers;
    if(layers){
      layers[index].style = style;
      layers[index].labels = labels;
      layers[index].legend_html = legend;
      this.updateMap(layers);
      this.setState({mapLayers: layers});
    }
  }

  saveMap(title: LocalizedString, position: Object, basemap: string, _csrf: string, cb: Function){
    var _this = this;
    //resave an existing map
    Object.keys(title).forEach(key =>{
      title[key] = title[key].trim();
    });
    request.post('/api/map/save')
    .type('json').accept('json')
    .send({
        map_id: this.state.map_id,
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        settings: this.state.settings,
        title,
        position,
        basemap,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({title, position, basemap});
        cb();
      });
    });
  }

  createMap(title: LocalizedString, position: Object, basemap: string, group_id: string, isPrivate: boolean, _csrf: string, cb: Function){
    var _this = this;
    Object.keys(title).forEach(key =>{
      title[key] = title[key].trim();
    });
    request.post('/api/map/create')
    .type('json').accept('json')
    .send({
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        settings: this.state.settings,
        title,
        group_id,
        position,
        basemap,
        private: isPrivate,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        var map_id = res.body.map_id;
        _this.setState({title, map_id, position, basemap, owned_by_group_id: group_id, isPrivate});
        cb();
      });
    });
  }

  savePrivate(isPrivate: boolean, _csrf: string, cb: Function){
    var _this = this;
    request.post('/api/map/privacy')
    .type('json').accept('json')
    .send({
        map_id: this.state.map_id,
        private: isPrivate,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({isPrivate});
        cb();
      });
    });
  }

  //helpers
  updateMap(mapLayers: Array<Layer>, rebuild: boolean =true){
    var mapStyle;
    if(rebuild){
      mapStyle = this.buildMapStyle(mapLayers);
    }else{
       mapStyle = this.state.mapStyle;
    }
    this.setState({mapLayers, mapStyle});
  }

  buildMapStyle(layers: Array<Layer>){
  return MapStyles.style.buildMapStyle(layers);
 }

   startEditing(){
    this.setState({editingLayer: true});
   }

   stopEditing(){
    this.setState({editingLayer: false});
   }

   deleteMap(map_id: number, _csrf: string, cb: Function){
     request.post('/api/map/delete')
     .type('json').accept('json')
     .send({map_id, _csrf})
     .end((err, res) => {
       checkClientError(res, err, cb, (cb) => {
         cb();
       });
     });
   }
}