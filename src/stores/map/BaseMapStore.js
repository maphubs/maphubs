var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../../actions/map/BaseMapActions');
var debug = require('../../services/debug')('stores/BaseMapStore');
var request = require('superagent');
var _bboxPolygon = require('@turf/bbox-polygon');
var _intersect = require('@turf/intersect');
var _debounce = require('lodash.debounce');
var _distance = require('@turf/distance');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return {
      baseMap: 'default',
      attribution: '© Mapbox © OpenStreetMap',
      bingImagerySet: null,
      updateWithMapPosition: false
    };

  },

  setBaseMap(baseMap){
    this.setState({baseMap});
  },


  debouncedUpdateMapPosition: _debounce(function(position, bbox){
    var _this = this;

    if(_this.position){
      var from = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [_this.position.lng, _this.position.lat]
        }
      };
      var to = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [position.lng, position.lat]
        }
      };
      var distance = _distance(from, to, "kilometers");
      debug('map moved: ' + distance + 'km');     
      if(distance < 50 && Math.abs(_this.position.zoom - position.zoom) < 1){
        _this.position = position;
        return;
      } 
    }

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
            var resource = metadata.resourceSets[0].resources[0];
            var imageryTime = '';
            if(resource.vintageEnd){
              imageryTime = '<b class="no-margin no-padding">(' + resource.vintageEnd + ')</b>';
            }
            var imageryProviders = resource.imageryProviders;
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
             attributionString =  attributionString + ': ' + imageryTime + ' ' + attributions.toString();
          }     
          _this.position = position;
          _this.setState({attribution: attributionString});
      }
    });

  }),

  //Inspired by: https://github.com/gmaclennan/leaflet-bing-layer
  updateMapPosition(position, bbox){
   
    //ignore unless using a service that needs this... like Bing
    if(this.state.updateWithMapPosition){
      this.debouncedUpdateMapPosition(position, bbox);
    }
      
  },

  initialize: function (options) {
    if (typeof options === 'string') {
    }
  },

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
    if(!mapName) mapName = 'default';

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
    else if(mapName == 'stamen-toner'){
      style={
        "version": 8,
        "sources": {
            "stamen-toner-tiles": {
                "type": "raster",
                "tiles":[  
                  "https://stamen-tiles-a.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
                  "https://stamen-tiles-b.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
                  "https://stamen-tiles-c.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
                  "https://stamen-tiles-d.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
                ],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "stamen-toner-tiles",
            "type": "raster",
            "source": "stamen-toner-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    };
    this.setState({
      attribution: 'Stamen Design (CC BY 3.0) Data by OpenStreetMap (ODbL)',
      updateWithMapPosition: false
    });
     cb(style);
    }
    else if(mapName == 'stamen-terrain'){
      style={
        "version": 8,
        "sources": {
            "stamen-terrain-tiles": {
                "type": "raster",
                "tiles":[  
                  "https://stamen-tiles-a.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
                  "https://stamen-tiles-b.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
                  "https://stamen-tiles-c.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
                  "https://stamen-tiles-d.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png"
                ],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "stamen-terrain-tiles",
            "type": "raster",
            "source": "stamen-terrain-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    };
    this.setState({
      attribution: 'Stamen Design (CC BY 3.0) Data by OpenStreetMap (ODbL)',
      updateWithMapPosition: false
    });
     cb(style);
    }
     else if(mapName == 'stamen-watercolor'){
      style={
        "version": 8,
        "sources": {
            "stamen-watercolor-tiles": {
                "type": "raster",
                "tiles":[  
                  "https://stamen-tiles-a.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png",
                  "https://stamen-tiles-b.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png",
                  "https://stamen-tiles-c.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png",
                  "https://stamen-tiles-d.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png"
                ],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "stamen-watercolor-tiles",
            "type": "raster",
            "source": "stamen-watercolor-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    };
    this.setState({
      attribution: ' Stamen Design (CC BY 3.0) Data by OpenStreetMap (CC BY SA)',
      updateWithMapPosition: false
    });
     cb(style);
    }
     else if(mapName == 'landsat-2014'){
      style={
        "version": 8,
        "sources": {
            "landsat-2014": {
                "type": "raster",
                "tiles":[  
                  "https://mapforenvironment.org/raster/congo-landsat-2014/{z}/{x}/{y}.png"
                ],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "landsat-2014",
            "type": "raster",
            "source": "landsat-2014",
            "minzoom": 3,
            "maxzoom": 12
        }]
    };
    this.setState({
      attribution: ' Landsat 7',
      updateWithMapPosition: false
    });
     cb(style);
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
        this.setState({attribution: '© Mapbox © OpenStreetMap', updateWithMapPosition: false});
        cb(url);
    }
   
  },

  });