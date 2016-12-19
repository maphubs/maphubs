var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/HubActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;
var findIndex = require('lodash.findindex');
var forEachRight = require('lodash.foreachright');
var $ = require('jquery');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      hub: {},
      layers: [],
      logoImage: null,
      bannerImage: null,
      logoImageInfo: null,
      bannerImageInfo: null,
      hasLogoImage: false,
      hasBannerImage: false,
      unsavedChanges: false,
      saving: false
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners

 loadHub(hub){
   debug('load hub');
   this.setState({hub});
 },

 loadLayers(layers){
   debug('load layers');
   this.setState({layers});
 },

 createHub(hub_id, group_id, name, published, _csrf, cb){
   debug('create hub');
   var _this = this;

   request.post('/api/hub/create')
   .type('json').accept('json')
   .send({
     hub_id,
     group_id,
     name,
     published,
     _csrf
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var hub = {
         hub_id,
         name,
         published
       };
       _this.setState({hub});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },
 saveHub(_csrf, cb){
   debug('save hub');
   var _this = this;

   var baseUrl = '/hub/' + this.state.hub.hub_id;

   this.setState({saving: true});
   request.post(baseUrl + '/api/save')
   .type('json').accept('json')
   .send({
     hub_id: this.state.hub.hub_id,
     name: this.state.hub.name,
     description: this.state.hub.description,
     tagline: this.state.hub.tagline,
     resources: this.state.hub.resources,
     about: this.state.hub.about,
     published: this.state.hub.published,
     style: this.state.hub.map_style,
     basemap: this.state.hub.basemap,
     position: this.state.hub.map_position,
     layers:  this.state.layers,
     logoImage: this.state.logoImage,
     logoImageInfo: this.state.logoImageInfo,
     bannerImage: this.state.bannerImage,
    bannerImageInfo: this.state.bannerImageInfo,
    _csrf

   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({saving: false, unsavedChanges: false});
       cb(null);
     });
   });
 },
 deleteHub(_csrf, cb){
   var _this = this;
   debug('delete hub');
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/delete')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id, _csrf})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({hub: {}});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },

 setMap(layers, style, position, basemap){
   var hub = this.state.hub;
   hub.map_style = style;
   hub.map_position = position;
   hub.basemap = basemap;
   this.setState({hub, layers, unsavedChanges: true});
   this.trigger(this.state);
 },

 setHubLogoImage(data, info){
    var hub = this.state.hub;
    hub.hasLogoImage = true;
   this.setState({logoImage: data, logoImageInfo: info, unsavedChanges: true, hub});
 },

 setHubBannerImage(data, info){
   var hub = this.state.hub;
    hub.hasBannerImage = true;
   this.setState({bannerImage: data, bannerImageInfo: info, unsavedChanges: true, hub});
 },

 setTitle(title){
   var hub = this.state.hub;
   hub.name = title;
   this.setState({hub, unsavedChanges: true});
 },

  publish(_csrf, cb){
   var hub = this.state.hub;
   hub.published = true;
   this.setState({hub, unsavedChanges: true});
   this.trigger(this.state);
   this.saveHub(_csrf, cb);
 },

 setTagline(tagline){
   var hub = this.state.hub;
   hub.tagline = tagline;
   this.setState({hub, unsavedChanges: true});
 },

 setDescription(description){
   var hub = this.state.hub;
   hub.description = description;
   this.setState({hub, unsavedChanges: true});
 },

 setResources(resources){
   var hub = this.state.hub;
   hub.resources = resources;
   this.setState({hub, unsavedChanges: true});
 },

 setAbout(about){
   var hub = this.state.hub;
   hub.about = about;
   this.setState({hub, unsavedChanges: true});
 },

 //map functions
 toggleVisibility(layer_id, cb){
   var layers = this.state.layers;
   var index = findIndex(layers, {layer_id});

   if(layers[index].active){
     layers[index].active = false;
   }else {
     layers[index].active = true;
   }

   this.updateMap(layers);
   cb();
 },

 moveUp(layer_id){
   var index = findIndex(this.state.layers, {layer_id});
   if(index === 0) return;
   var layers = this.move(this.state.layers, index, index-1);
   this.updateMap(layers);
 },

 moveDown(layer_id){
   var index = findIndex(this.state.layers, {layer_id});
   if(index === this.state.layers.length -1) return;
   var layers = this.move(this.state.layers, index, index+1);
   this.updateMap(layers);
 },

 move(array, fromIndex, toIndex) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
    return array;
  },

 updateMap(layers){
   var style = this.buildMapStyle(layers);
  var hub = this.state.hub;
  hub.map_style = style;
   this.setState({layers, hub});
   this.trigger(this.state);
 },

 buildMapStyle(layers){
   var mapStyle = {
     sources: {},
     layers: []
   };

   //reverse the order for the styles, since the map draws them in the order recieved
   forEachRight(layers, function(layer){
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
       $.extend(mapStyle.sources, style.sources);
       //add layers
       mapStyle.layers = mapStyle.layers.concat(style.layers);
     } else {
       debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
     }

   });
   return mapStyle;
 }

});
