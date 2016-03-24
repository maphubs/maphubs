var React = require('react');

var classNames = require('classnames');
var FeatureBox = require('./FeatureBox');
var styles = require('./styles');
var debug = require('../../services/debug')('map');
var config = require('../../clientconfig');
var isEqual = require('lodash.isequal');
var _debounce = require('lodash.debounce');
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');
var $ = require('jquery');
var TerraformerGL = require('../../services/terraformerGL.js');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var mapboxLight = require('../../node_modules/mapbox-gl-styles/styles/light-v8.json');
var mapboxDark = require('../../node_modules/mapbox-gl-styles/styles/dark-v8.json');
var mapboxStreets = require('../../node_modules/mapbox-gl-styles/styles/streets-v8.json');
var mapboxOutdoors = require('../../node_modules/mapbox-gl-styles/styles/outdoors-v8.json');
var mapboxSatellite = require('../../node_modules/mapbox-gl-styles/styles/satellite-hybrid-v8.json');

var mapboxgl ={};
if (typeof window === 'undefined') {
   mapboxgl = require("mapbox-gl");
} else {
   mapboxgl = require("../../node_modules/mapbox-gl/dist/mapbox-gl");
}

var Map = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    center: React.PropTypes.object,
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    maxBounds: React.PropTypes.object,
    maxZoom: React.PropTypes.number,
    minZoom: React.PropTypes.number,
    height: React.PropTypes.string,
    style: React.PropTypes.object,
    glStyle: React.PropTypes.object,
    zoom: React.PropTypes.number,
    keyboard: React.PropTypes.bool,
    year: React.PropTypes.number,
    features:  React.PropTypes.array,
    tileJSONType: React.PropTypes.string,
    tileJSONUrl:  React.PropTypes.string,
    data: React.PropTypes.object,
    interactive: React.PropTypes.bool,
    showPlayButton: React.PropTypes.bool,
    showFeatureInfoEditButtons: React.PropTypes.bool,
    fitBounds: React.PropTypes.array,
    disableScrollZoom: React.PropTypes.bool,
    enableRotation: React.PropTypes.bool,
    navPosition:  React.PropTypes.string,
    baseMap: React.PropTypes.string
  },

  contextTypes: {
    router: React.PropTypes.func
  },



  getDefaultProps() {
    return {
      maxZoom: 18,
      minZoom: 5,
      keyboard: false,
      className: '',
      interactive: true,
      showFeatureInfoEditButtons: true,
      showPlayButton: true,
      navPosition: 'top-right',
      baseMap: 'default'
    };
  },

  getInitialState() {
    return {
    //  id: uniqueId('map')
    id: this.props.id ? this.props.id : 'map',
    selectedFeatures: null,
    selected: false,
    interactive: this.props.interactive,
    glStyle: this.props.glStyle ? this.props.glStyle : null,
    mapLoaded: false,
    baseMap: this.props.baseMap
  };
  },

  getPosition(){
    if(this.map){
      var center =this.map.getCenter();
      var zoom = this.map.getZoom();
      return {
          zoom,
          lng: center.lng,
          lat: center.lat
      };
    }
  },

  getBounds(){
    if(this.map){
      return this.map.getBounds().toArray();
    }
  },

  addLayers(map, glStyle){
    var _this = this;
    glStyle.layers.forEach(function(layer){
    try{
      if(layer.type == 'mapbox-style-placeholder'){
        _this.mbstyle.layers.forEach(function(mbStyleLayer){
          if(mbStyleLayer.type !== 'background'){ //ignore the Mapbox Studio background layer
            map.addLayer(mbStyleLayer);
          }
        });
      }else{
        map.addLayer(layer);
      }

    }catch(err){
      debug('Failed to add layer: ' + layer.id);
      debug(err);
    }
    });
  },

  removeAllLayers(prevStyle){
    var _this = this;
    if(prevStyle && prevStyle.layers){
      prevStyle.layers.forEach(function(layer){
        try{
          if(layer.type == 'mapbox-style-placeholder'){
            _this.mbstyle.layers.forEach(function(mbStyleLayer){
              _this.map.removeLayer(mbStyleLayer.id);
            });
          }else{
            _this.map.removeLayer(layer.id);
          }

        }catch(err){
          debug('Failed to remove layer: ' + layer.id);
        }
      });
    }

  },

  removeAllSources(prevStyle){
    var _this = this;
      if(prevStyle && prevStyle.sources){
      Object.keys(prevStyle.sources).forEach(function(key) {
          try{
            if(prevStyle.sources[key].type == 'mapbox-style' && _this.mbstyle){
              Object.keys(_this.mbstyle.sources).forEach(function(mbstyleKey) {
                _this.map.removeSource(mbstyleKey);
              });
            }else{
              _this.map.removeSource(key);
            }

          }catch(err){
            debug('Failed to remove source: ' + key);
          }
      });
    }
  },

  setSelectionFilter(features){
    var _this = this;
    if(this.state.glStyle){
      this.state.glStyle.layers.forEach(function(layer){
        var filter = ['in', "osm_id"];
        features.forEach(function(feature){
          filter.push(feature.properties.osm_id);
        });
        if(layer.id.startsWith('omh-hover-point')){
          _this.map.setFilter(layer.id,  ["all", ["in", "$type", "Point"], filter]);
        }else if(layer.id.startsWith('omh-hover-line')){
          _this.map.setFilter(layer.id,  ["all", ["in", "$type", "LineString"], filter]);
        }else if(layer.id.startsWith('omh-hover-polygon')){
          _this.map.setFilter(layer.id,  ["all", ["in", "$type", "Polygon"], filter]);
        }
      });
    }

  },


  clearSelectionFilter(){
    var _this = this;
    if(this.state.glStyle){
      this.state.glStyle.layers.forEach(function(layer){
        if(layer.id.startsWith('omh-hover')){
          _this.map.setFilter(layer.id,  ["==", "osm_id", ""]);
        }
      });
    }
  },

  reload(prevStyle, newStyle, baseMap=null){
    //if no style is provided assume we are reloading the active style
    if(!prevStyle) prevStyle = this.props.glStyle;
    if(!newStyle) newStyle = prevStyle;
    this.removeAllLayers(prevStyle);
    this.removeAllSources(prevStyle);
    if(baseMap){
      var bounds = this.map.getBounds();
      this.setState({restoreBounds: bounds});
      this.map.setStyle(baseMap);
    }
    this.addMapData(this.map, newStyle, this.props.data, function(){});
  },

  componentWillMount(){
    //disable interactive layers in the Mapbox basemap
    mapboxLight.layers.forEach(function(layer){
      layer.interactive = false;
    });

    mapboxStreets.layers.forEach(function(layer){
      layer.interactive = false;
    });

    mapboxSatellite.layers.forEach(function(layer){
      layer.interactive = false;
    });
  },

  componentDidMount() {
    this.createMap();

    $(this.refs.basemapButton).show();
  },

  addMapData(map, glStyle, geoJSON, cb){
    var _this = this;
    if(glStyle && glStyle.sources){
      var requests = [];
      Object.keys(glStyle.sources).forEach(function(key) {
        var type = glStyle.sources[key].type;
        var url = glStyle.sources[key].url;
        if(key != 'osm' && type === 'vector' && !url.startsWith('mapbox://')  ){
          //load as tilejson
          requests.push(request.get(url)
          .then(function(res) {
            var tileJSON = res.body;
            tileJSON.type = 'vector';

            map.on('source.load', function(e) {
              if (e.source.id === key && !_this.props.fitBounds && !_this.state.restoreBounds) { //don't zoom if we have props telling the map where to display
                map.fitBounds([[tileJSON.bounds[0], tileJSON.bounds[1]],
                               [tileJSON.bounds[2], tileJSON.bounds[3]]]);
              }
            });
            map.addSource(key, tileJSON);
          }, function(error) {
           debug(error);
          })
        );
      } else if(type === 'mapbox-style'){
        var mapboxid = glStyle.sources[key].mapboxid;
        url = 'https://api.mapbox.com/styles/v1/' + mapboxid + '?access_token=' + config.MAPBOX_ACCESS_TOKEN;
        requests.push(request.get(url)
          .then(function(res) {
            var mbstyle = res.body;
            _this.mbstyle = mbstyle;

            //TODO: not sure if it is possible to combine sprites/glyphs sources yet, so this doesn't work with all mapbox styles

            //add sources
            Object.keys(mbstyle.sources).forEach(function(key) {
              var source = mbstyle.sources[key];
              map.on('source.load', function(e) {
                if (e.source.id === key && !_this.props.fitBounds) { //don't zoom if we have props telling the map where to display
                  map.flyTo({center: mbstyle.center, zoom:mbstyle.zoom});
                }
              });
              map.addSource(key, source);
            });
          })
        );


      } else if(type === 'ags-mapserver-query'){
        requests.push(TerraformerGL.getArcGISGeoJSON(url)
        .then(function(geoJSON) {

          if(geoJSON.bbox && geoJSON.bbox.length > 0 && !_this.props.fitBounds){
            _this.zoomToData(geoJSON);
          }

          var geoJSONSource = new mapboxgl.GeoJSONSource({data: geoJSON});
          map.addSource(key, geoJSONSource);
        }, function(error) {
         debug(error);
        })
      );
    } else if(type === 'ags-featureserver-query'){
      requests.push(TerraformerGL.getArcGISFeatureServiceGeoJSON(url)
      .then(function(geoJSON) {

        if(geoJSON.bbox && geoJSON.bbox.length > 0 && !_this.props.fitBounds){
          _this.zoomToData(geoJSON);
        }

        var geoJSONSource = new mapboxgl.GeoJSONSource({data: geoJSON});
        map.addSource(key, geoJSONSource);
      }, function(error) {
       debug(error);
      })
    );
  } else {
      //just add the source as-is
        map.addSource(key, glStyle.sources[key]);
    }

      });
      //once all sources are loaded then load the layers
      Promise.all(requests).then(function(){
        _this.addLayers(map, glStyle);
        cb();
      }).catch(function(err){
        debug(err);
        //try to load the map anyway
        _this.addLayers(map, glStyle);
        cb();
      });
    }
    else if(geoJSON){
      _this.initGeoJSON(map, geoJSON);
    }
  },

  createMap() {
    var _this = this;
    mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;

      var baseMap = this.getBaseMapFromName(this.state.baseMap);

  var map = new mapboxgl.Map({
    container: this.state.id,
    style: baseMap,
    zoom: 0,
    interactive: this.state.interactive,
    center: [0,0]
  });

  map.on('style.load', function() {

   //add the omh data
    _this.addMapData(map, _this.state.glStyle, _this.props.data, function(){
      //do stuff that needs to happen after data loads?
    });

    //mapbox-gl 0.11.1 has a bug in the default error handler for tile.error
    map.off('tile.error', map.onError);
    map.on('tile.error', function(e){
      debug(e.type);
    });

    if (_this.state.restoreBounds){
      map.fitBounds(_this.state.restoreBounds, {animate:false});
    } else if (_this.props.fitBounds){
      map.fitBounds(_this.props.fitBounds, {animate:false});
    }

    if(_this.state.locale != 'en'){
      _this.changeLocale(_this.state.locale);
    }

    _this.setState({mapLoaded: true});

    });


map.on('mousemove', function(e) {
    if(_this.state.selected) return;
    var debounced = _debounce(function(){
      map.featuresAt(e.point, {
        radius: 5,
        includeGeometry: false
      }, function(err, features) {
          if (err) throw err;
          if (!err && features.length) {
                 _this.setSelectionFilter(features);
                 _this.setState({selectedFeatures:features});
                 map.addClass('selected');

             } else if(_this.state.selectedFeatures != null) {
                 _this.clearSelection();
             }
      });
    }, 200).bind(this);
    debounced();

 });

 map.on('click', function(e) {
   if(_this.state.selected){
     _this.setState({selected: false});
     _this.clearSelection();
   }
   else if(_this.state.selectedFeatures && _this.state.selectedFeatures.length > 0){
     _this.setState({selected:true});
   }else{
     map.featuresAt(e.point, {
       radius: 5,
       includeGeometry: false
     }, function(err, features) {
         if (err) throw err;
         if (!err && features.length) {
                _this.setSelectionFilter(features);
                _this.setState({selectedFeatures:features, selected:true});
                map.addClass('selected');

            } else if(_this.state.selectedFeatures != null) {
                _this.clearSelection();
            }
     });
   }
  });


  if(this.state.interactive){
    map.addControl(new mapboxgl.Navigation({position: this.props.navPosition}));
  }

  if(this.props.disableScrollZoom){
    map.scrollZoom.disable();
  }

  if(!this.props.enableRotation){
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
  }



  this.map = map;

  },

  clearSelection(){

    if(this.map.hasClass('selected')){
      this.map.removeClass('selected');
    }

    this.clearSelectionFilter();
    this.setState({selectedFeatures:null});
  },



  shouldUpdateCenter(next, prev) {
    if (!prev) return true;
    next = this.normalizeCenter(next);
    prev = this.normalizeCenter(prev);
    return next[0] !== prev[0] || next[1] !== prev[1];
  },

  componentDidUpdate(prevProps, prevState) {
    var center = this.props.center;
    var zoom = this.props.zoom;
    if (center && this.shouldUpdateCenter(center, prevProps.center)) {
      this.map.setView(center, zoom, {animate: false});
    }
    else if (zoom && zoom !== prevProps.zoom) {
      this.map.setZoom(zoom);
    }

    if(this.state.interactive && !prevState.interactive){
      this.map.addControl(new mapboxgl.Navigation({position: 'top-left'}));
      this.map.interaction.enable();
    }

      if(this.state.locale && (this.state.locale != prevState.locale) ){
        this.changeLocale(this.state.locale);
      }


          if(this.props.fitBounds) {

            if(!isEqual(this.props.fitBounds,prevProps.fitBounds)) {
              //this.map.flyTo({center: [0, 0], zoom: 9});
              var bounds = this.props.fitBounds;
                this.map.fitBounds([[bounds[0], bounds[1]],
                              [bounds[2], bounds[3]]]);
            }
          }

  },

  componentWillReceiveProps(nextProps){
    if(nextProps.data){
      if(this.state.geoJSONData){
        //update existing data
        this.state.geoJSONData.setData(nextProps.data);
        this.zoomToData(nextProps.data);
      }else if(this.state.geoJSONData === undefined && this.props.data){
        //do nothing, still updating from the last prop change...
      }else {
        this.initGeoJSON(this.map, nextProps.data);
      }
    }

    if(nextProps.glStyle) {
      if(!isEqual(this.state.glStyle,nextProps.glStyle)) {
          this.reload(this.state.glStyle, nextProps.glStyle);
          this.setState({glStyle: nextProps.glStyle});
      }

    }

    if(nextProps.fitBounds) {
      var bounds = nextProps.fitBounds;
        this.map.fitBounds([[bounds[0], bounds[1]],
                      [bounds[2], bounds[3]]]);
    }


  },

  initGeoJSON(map, data){
    if(data && data.features && data.features.length > 0){
      var geoJSONData = new mapboxgl.GeoJSONSource({data});
      map.addSource("omh-geojson", geoJSONData);
      var glStyle = styles.defaultStyle('geojson');
      delete glStyle.sources; //ignore the tilejson source
      this.addLayers(map, glStyle);
      this.setState({geoJSONData});
      this.zoomToData(data);
    } else {
      //empty data
      debug('Empty/Missing GeoJSON Data');
    }
  },

  resetGeoJSON(){
    var geoJSONData = this.state.geoJSONData;
    this.state.geoJSONData.setData({
      type: 'FeatureCollection',
      features: []
    });
    this.setState({geoJSONData});
    this.map.flyTo({center: [0,0], zoom:0});
  },

  changeLocale(locale){
    var map = this.map;
    debug('changing map language to: ' + locale);
    map.setLayoutProperty('country-label-lg', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('country-label-md', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('country-label-sm', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('state-label-lg', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_other', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_3', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_2', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_point_1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_other', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_3', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_2', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('marine_label_line_1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_neighborhood', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_other', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_small_s', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_small_n', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_medium_s', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_medium_n', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_large_s', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('place_label_city_large_n', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('road-label-sm', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('road-label-med', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('road-label-large', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('airport-label', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('poi-parks-scalerank1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('poi-scalerank1', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('waterway-label', 'text-field', '{name_' + locale + '}');
    map.setLayoutProperty('water-label', 'text-field', '{name_' + locale + '}');



  },

  zoomToData(data){
    if(data.bbox && data.bbox.length > 0){
      var bbox = data.bbox;
      var sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
      var ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
      var llb = new mapboxgl.LngLatBounds(sw, ne);
      this.map.fitBounds(llb, {padding: 25, curve: 3, speed:0.6, maxZoom: 12});
    }
  },

  flyTo(center, zoom){
    this.map.flyTo({center, zoom});
  },

  fitBounds(bbox, maxZoom, padding = 0){
    var sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
    var ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
    var llb = new mapboxgl.LngLatBounds(sw, ne);
    this.map.fitBounds(llb, {padding, curve: 1, speed:0.6, maxZoom});
  },

  componentWillUnmount() {
    this.map.remove();
  },

  updatePosition() {
    var map = this.map;
    map.setView(this.state.map.position.center, this.state.map.position.zoom, {animate: false});
  },

  handleUnselectFeature() {
    this.setState({selected:false});
    this.clearSelection();
  },

  startInteractive(){
    this.setState({interactive: true});
  },

  toggleBaseMaps(){
    if(this.state.showBaseMaps){
      this.closeBaseMaps();
    }else{
      this.setState({showBaseMaps: true});
    }
  },

  closeBaseMaps(){
    this.setState({showBaseMaps: false});
  },

  getBaseMapFromName(mapName){
    var baseMap = mapboxLight;
    if (mapName == 'default') {
        baseMap = mapboxLight;
    }
    else if(mapName == 'dark'){
      baseMap = mapboxDark;
    }
    else if(mapName == 'outdoors'){
      baseMap = mapboxOutdoors;
    }
    else if(mapName == 'streets'){
      baseMap = mapboxSatellite;
    }
    else if(mapName == 'mapbox-satellite'){
      baseMap = mapboxSatellite;
    }

    return baseMap;
  },

  getBaseMapName(){
    return this.state.baseMap;
  },

  changeBaseMap(mapName){
    var baseMap = this.getBaseMapFromName(mapName);
    this.closeBaseMaps();
    this.setState({baseMap: mapName});
    this.reload(this.state.glStyle, this.state.glStyle, baseMap);
  },

  render() {

    var className = classNames('mode', 'map', 'active');

    var featureBox = '';
    if(this.state.selectedFeatures && this.state.selectedFeatures.length > 0){
      featureBox = (
        <FeatureBox
            features={this.state.selectedFeatures}
            selected={this.state.selected}
            onUnselected={this.handleUnselectFeature}
            showButtons={this.props.showFeatureInfoEditButtons}
            style={{}}
        />
      );
    }

    var style = {};
    if(this.props.style){
      style = this.props.style;
    }

    var interactiveButton = '';
    if(!this.state.interactive && this.props.showPlayButton){
      interactiveButton = (
        <a onClick={this.startInteractive} className="btn-floating waves-effect waves-light omh-btn"
          style={{position: 'absolute', left: '5px', bottom: '30px',  zIndex: '999'}}><i className="material-icons">play_arrow</i></a>
      );
    }

    var logo = '', children = '';
    if(this.state.mapLoaded){
      logo = (
        <img style={{position:'absolute', left: '5px', bottom: '0px', zIndex: '1'}} width="70" height="19" src="/assets/maphubs-logo-small.png" alt="MapHubs Logo"/>
      );
      children = this.props.children;
    }

    var baseMapBox = '';
    if(this.state.showBaseMaps){
      var _this = this;
      baseMapBox = (
        <div className="features z-depth-1" style={{width: '240px', textAlign: 'center'}}>
            <ul className="collection with-header" style={{margin: 0, width: '100%'}}>
              <li className="collection-header">
                <h6>{this.__('Base Maps')}</h6>
              </li>
             <li className="collection-item">
               <a className="btn" onClick={function(){_this.changeBaseMap('default');}}>{this.__('Default')}</a>
             </li>
             <li className="collection-item">
               <a className="btn" onClick={function(){_this.changeBaseMap('dark');}}>{this.__('Dark')}</a>
             </li>
             <li className="collection-item">
               <a className="btn" onClick={function(){_this.changeBaseMap('streets');}}>{this.__('Streets')}</a>
             </li>
             <li className="collection-item">
               <a className="btn" onClick={function(){_this.changeBaseMap('outdoors');}}>{this.__('Outdoors')}</a>
             </li>
             <li className="collection-item">
               <a className="btn" onClick={function(){_this.changeBaseMap('mapbox-satellite');}}>{this.__('Satellite')}</a>
             </li>
           </ul>



        </div>
      );
    }


    return (
      <div  className={this.props.className} style={style}>
        <div id={this.state.id} className={className} style={{width:'100%', height:'100%'}}>
          <a
            onClick={this.toggleBaseMaps}
            style={{position: 'absolute',
              top: '10px',
              right: '10px',
              height:'30px',
              zIndex: '100',
              lineHeight: '30px',
              textAlign: 'center',
              width: '30px'}}
            >
            <i className="material-icons z-depth-1"
              ref="basemapButton"
              style={{height:'30px',
                      lineHeight: '30px',
                      display: 'none',
                      width: '30px',
                      color: '#29ABE2',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      borderColor: '#ddd',
                      borderStyle: 'solid',
                      borderWidth: '1px',
                      fontSize:'25px'}}
              >layers</i>
          </a>
          {baseMapBox}
          {featureBox}
          {interactiveButton}
          {children}
          {logo}
        </div>
        </div>
    );
  }
});

module.exports = Map;
