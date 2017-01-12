var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/CreateMapActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/create-map-store');
var _findIndex = require('lodash.findindex');
var _reject = require('lodash.reject');
var _find = require('lodash.find');
var _forEachRight = require('lodash.foreachright');
//var $ = require('jquery');
var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      map_id: -1,
      story_id: -1,
      hub_id: null,
      title: null,
      mapLayers: [],
      allLayers: null,
      searchLayers: [],
      show: false,
      mapStyle: null,
      position: null,
      basemap: 'default'
    };
  },

  reset(){
    this.setState(this.getInitialState());
    this.updateMap(this.state.mapLayers);
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners
  setSearchLayers(searchLayers){
    if(!this.state.allLayers){
      this.setState({searchLayers, allLayers: searchLayers});
    }else{
      this.setState({searchLayers});
    }
  },

  setMapLayers(mapLayers){
    this.setState({mapLayers});
    this.updateMap(mapLayers);
  },

  setMapId(map_id){
    this.setState({map_id});
  },

  setStoryId(story_id){
    this.setState({story_id});
  },

  setHubId(hub_id){
    this.setState({hub_id});
  },

  setMapTitle(title){
    this.setState({title});
  },

  setMapPosition(position){
    this.setState({position});
  },

  setMapBasemap(basemap){
    this.setState({basemap});
  },

  search(input, cb){
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/layers/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      if (err) {
        cb(JSON.stringify(err));
      }else{
        if(res.body.layers){
          _this.setSearchLayers(res.body.layers);
          cb(null);
        }else{
          cb(JSON.stringify(res.body));
        }
      }
    });
  },

  addToMap(layer, cb){
    //check if the map already has this layer
    if(_find(this.state.mapLayers, {layer_id: layer.layer_id})){
      cb(true);
    }else{
      layer.active = true; //tell the map to make this layer visible
      var layers = this.state.mapLayers;
      layers.push(layer);
      this.updateMap(layers);
      cb();
    }

  },

  removeFromMap(layer){
    var layers = _reject(this.state.mapLayers, {'layer_id': layer.layer_id});
    this.updateMap(layers);
  },

  toggleVisibility(layer_id, cb){
    var mapLayers = this.state.mapLayers;
    var index = _findIndex(mapLayers, {layer_id});

    if(mapLayers[index].active){
      mapLayers[index].active = false;
    }else {
      mapLayers[index].active = true;
    }

    this.updateMap(mapLayers);
    cb();
  },

  moveUp(layer){
    var index = _findIndex(this.state.mapLayers, {'layer_id': layer.layer_id});
    if(index === 0) return;
    var layers = this.move(this.state.mapLayers, index, index-1);
    this.updateMap(layers);
  },

  moveDown(layer){
    var index = _findIndex(this.state.mapLayers, {'layer_id': layer.layer_id});
    if(index === this.state.mapLayers.length -1) return;
    var layers = this.move(this.state.mapLayers, index, index+1);
    this.updateMap(layers);
  },

  updateLayerStyle(layer_id, style, labels, legend){
    var index = _findIndex(this.state.mapLayers, {layer_id});
    var layers = this.state.mapLayers;
    layers[index].map_style = style;
    layers[index].map_labels = labels;
    layers[index].map_legend_html = legend;
    this.updateMap(layers);
  },

  showMapDesigner(){
    this.setState({show: true});
  },

  closeMapDesigner(){
    this.setState({map_id: null, show: false});
  },

  //helpers
  updateMap(mapLayers){
    var mapStyle = this.buildMapStyle(mapLayers);
    this.setState({mapLayers, mapStyle});
  },

  move(array, fromIndex, toIndex) {
     array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
     return array;
   },

   buildMapStyle(layers){
     var mapStyle = {
       sources: {},
       layers: []
     };

     //reverse the order for the styles, since the map draws them in the order recieved
     _forEachRight(layers, function(layer){
       if(!layer.map_style) layer.map_style = layer.style;
       if(!layer.map_labels) layer.map_labels = layer.labels;
       if(!layer.map_settings) layer.map_settings = layer.settings;
       var style = layer.map_style;
       if(style && style.sources && style.layers){
         //check for active flag and update visibility in style
         if(layer.active != undefined && layer.active == false){
           //hide style layers for this layer
           style.layers.forEach(function(styleLayer){
             if(!styleLayer['layout']){
               styleLayer['layout'] = {};
             }
             styleLayer['layout']['visibility'] = 'none';
           });
         } else {
           //reset all the style layers to visible
           style.layers.forEach(function(styleLayer){
             if(!styleLayer['layout']){
               styleLayer['layout'] = {};
             }
             styleLayer['layout']['visibility'] = 'visible';
           });
         }
         //add source
         mapStyle.sources = Object.assign(mapStyle.sources, style.sources);
         //add layers
         mapStyle.layers = mapStyle.layers.concat(style.layers);
       } else {
         debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
       }

     });

     return mapStyle;
   },

   reloadSearchLayersHub(hub_id, force, cb){
     debug('reload search layers');
     var _this = this;
     if(force || !this.state.allLayers){
       request.get('/api/layers/recommended/hub/'+ hub_id)
       .type('json').accept('json')
       .end(function(err, res){
         checkClientError(res, err, cb, function(cb){
           _this.setSearchLayers(res.body.layers);
           cb(null);
         });
       });
     }else{
       _this.setSearchLayers(_this.state.allLayers);
       cb(null);
     }
   }
});
