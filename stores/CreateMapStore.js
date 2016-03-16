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
var config = require('../clientconfig');
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
      searchLayers: [],
      show: false,
      mapStyle: null,
      position: null
    };
  },

  reset(){
    this.setState(this.getInitialState);
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners
  setSearchLayers(searchLayers){
    this.setState({searchLayers});
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

  editMap(map_id, cb){
    var _this = this;
    debug('editing map: ' + map_id);
    request.get(urlUtil.getBaseUrl(config.host, config.port) + '/api/map/info/' + map_id)
    .type('json').accept('json')
    .end(function(err, res){
      if (err) {
        cb(JSON.stringify(err));
      }else{
        var map = res.body.map;
        _this.setState({
          map_id,
          position: map.position,
          title: map.title,
          mapLayers: map.layers,
          show: true
        });
        _this.updateMap(map.layers);
        _this.setState({position:map.position});
        cb();
      }
    });
  },

  search(input, cb){
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl(config.host, config.port) + '/api/layers/search?q=' + input)
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

  updateLayerStyle(layer_id, style, legend){
    var index = _findIndex(this.state.mapLayers, {layer_id});
    var layers = this.state.mapLayers;
    layers[index].map_style = style;
    layers[index].map_legend_html = legend;
    this.updateMap(layers);
  },

  saveMap(position, cb){
    var _this = this;
    //resave an existing map
    request.post('/api/map/save')
    .type('json').accept('json')
    .send({
        map_id: this.state.map_id,
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        title: this.state.title,
        position
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        _this.setState({position});
        cb();
      });
    });
  },

  createUserMap(position, cb){
    var _this = this;
    request.post('/api/map/create/usermap')
    .type('json').accept('json')
    .send({
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        title: this.state.title,
        position
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        var map_id = res.body.map_id;
        _this.setState({map_id});
        cb();
      });
    });
  },

  createStoryMap(position, cb){
    var _this = this;
    if(!this.state.story_id || this.state.story_id === -1){
      var msg = 'Error, story_id not set';
      debug(msg);
      cb(msg);
    }
    request.post('/api/map/create/storymap')
    .type('json').accept('json')
    .send({
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        position,
        title: this.state.title,
        story_id: this.state.story_id
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        if (err) {
          cb(err);
        }else{
          var map_id = res.body.map_id;
          _this.setState({map_id});
          cb();
        }
      });
    });
  },

  showMapDesigner(){
    this.setState({show: true});
  },

  closeMapDesigner(){
    this.setState({show: false});
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
       var style = layer.map_style;
       if(style && style.sources && style.layers){
         //check for active flag and update visibility in style
         if(layer.active != undefined && layer.active == false){
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
         mapStyle.sources = Object.assign(mapStyle.sources, style.sources);
         //add layers
         mapStyle.layers = mapStyle.layers.concat(style.layers);
       } else {
         debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
       }

     });

     return mapStyle;
   },

   reloadSearchLayersUser(cb){
     debug('reload search layers');
     var _this = this;
     request.get('/api/layers/recommended/user')
     .type('json').accept('json')
     .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
         _this.setSearchLayers(res.body.layers);
         cb(null);
       });
     });
   },

   reloadSearchLayersHub(hub_id, cb){
     debug('reload search layers');
     var _this = this;
     request.get('/api/layers/recommended/hub/'+ hub_id)
     .type('json').accept('json')
     .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
         _this.setSearchLayers(res.body.layers);
         cb(null);
       });
     });
   },

   reloadSearchLayersAll(cb){
     debug('reload search layers');
     var _this = this;
     request.get('/api/layers/all')
     .type('json').accept('json')
     .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
         _this.setSearchLayers(res.body.layers);
         cb(null);
       });
     });
   },

   deleteMap(map_id, cb){
     request.post('/api/map/delete')
     .type('json').accept('json')
     .send({map_id})
     .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
         cb();
       });
     });
   }
});
