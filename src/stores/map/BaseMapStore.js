var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../../actions/map/BaseMapActions');
var debug = require('../../services/debug')('stores/BaseMapStore');
var request = require('superagent');
var _bboxPolygon = require('@turf/bbox-polygon');
var _intersect = require('@turf/intersect');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return {
      baseMap: 'default',
      showEditBaseMap: false,
      showBaseMaps: false,
      attribution: '© Mapbox © OpenStreetMap',
      bingImagerySet: null,
      updateWithMapPosition: false
    };

  },

  setBaseMap(baseMap){
    this.setState({baseMap});
  },

  //Inspired by: https://github.com/gmaclennan/leaflet-bing-layer
  updateMapPosition(position, bbox){
    var _this = this;
    //ignore unless using a service that needs this... like Bing
    if(this.state.updateWithMapPosition){
      var bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      var lat = position.lat;
      var lng = position.lng;
      var zoom = Math.round(position.zoom);
      var url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${this.state.bingImagerySet}/${lat},${lng}?zl=${zoom}&include=ImageryProviders&key=${MAPHUBS_CONFIG.BING_KEY}`;
      var attributionString = '© Bing Maps';
      request.get(url)
      .end(function(err, res){
        if(err){
          debug(err);
        }else{
          var metadata = res.body;
          var attributions = [];


          var bboxFeature = _bboxPolygon(bounds);
          if(metadata.resourceSets && metadata.resourceSets.length > 0 
            && metadata.resourceSets[0].resources && metadata.resourceSets[0].resources.length > 0 
            && metadata.resourceSets[0].resources[0].imageryProviders && metadata.resourceSets[0].resources[0].imageryProviders.length > 0){
            var imageryProviders = metadata.resourceSets[0].resources[0].imageryProviders;
            imageryProviders.forEach(function (provider) {
            for (var i = 0; i < provider.coverageAreas.length; i++) {
              var providerBboxFeature = _bboxPolygon(provider.coverageAreas[i].bbox);
            
              if (_intersect(bboxFeature, providerBboxFeature) &&
                zoom >= provider.coverageAreas[i].zoomMin &&
                zoom <= provider.coverageAreas[i].zoomMax) {
                attributions.push(provider.attribution);
              }
            }
            });
             attributionString =  attributionString + ': ' + attributions.toString();
          }     
          _this.setState({attribution: attributionString});
      }
    });
     
    }
  },

  initialize: function (options) {
    if (typeof options === 'string') {
    }
  },

  toggleBaseMaps(){
    if(this.state.showEditBaseMap){
      this.closeEditBaseMap();
    }
    if(this.state.showBaseMaps){
      this.closeBaseMaps();
    }else{
      this.setState({showBaseMaps: true});
    }
  },

  closeBaseMaps(){
    this.setState({showBaseMaps: false});
  },

    toggleEditBaseMap(){
    if(this.state.showBaseMaps){
      this.closeBaseMaps();
    }
    if(this.state.showEditBaseMap){
      this.closeEditBaseMap();
    }else{
      this.setState({showEditBaseMap: true});
    }
  },

  closeEditBaseMap(){
    this.setState({showEditBaseMap: false});
  },

//https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=AglFsH7yKSyaHko0gJFWCy5A-8IeWYGb2Bx_kkQOBk_fRbdNqWbEigfcL_WWA5LG&include=ImageryProviders
  getBingSource(type, cb){
    var url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${type}?key=${MAPHUBS_CONFIG.BING_KEY}&include=ImageryProviders`;
    request.get(url)
    .end(function(err, res){
      if(err){
        debug(err);
      }else{
        var metadata = res.body;
        //don't actually need anything from bing
        cb(metadata);
      }
    });
  },

  getBaseMapFromName(mapName, cb){
    var _this = this;
    var mapboxName;
    var style;
    var optimize = true;

    if (mapName == 'default') {
        mapboxName = 'light-v9';
        optimize = true;
    }
    else if(mapName == 'dark'){
      mapboxName = 'dark-v9';
      optimize = true;
    }
    else if(mapName == 'outdoors'){
      mapboxName = 'outdoors-v9';
      optimize = true;
    }
    else if(mapName == 'streets'){
      mapboxName = 'streets-v9';
      optimize = true;
    }
    else if(mapName == 'mapbox-satellite'){
      mapboxName = 'satellite-streets-v9';
      optimize = true;
    }
    else if(mapName == 'bing-satellite'){
      style={
        "version": 8,
        "sources": {
            "bing-tiles": {
                "type": "raster",
                "tiles":[  
                  "https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5522&mkt=en-us",
                  "https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5522&mkt=en-us",
                  "https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5522&mkt=en-us",
                  "https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5522&mkt=en-us"
                ],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "bing-tiles",
            "type": "raster",
            "source": "bing-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    };
    this.getBingSource('Aerial', function(){
      _this.setState({
        attribution: '© Bing Maps',
        bingImagerySet: 'Aerial',
        updateWithMapPosition: true
    });
      cb(style);
    });
    }
    if(mapboxName){
       var url = 'mapbox://styles/mapbox/' + mapboxName;
        if(optimize){
          url += '?optimize=true'; //requires mapbox-gl-js 0.24.0+
        }
        this.setState({attribution: '© Mapbox © OpenStreetMap'});
        cb(url);
    }
   
  },

  });