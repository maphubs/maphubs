var React = require('react');
var classNames = require('classnames');
var FeatureBox = require('./FeatureBox');
var debug = require('../../services/debug')('map');
var isEqual = require('lodash.isequal');
var Promise = require('bluebird');
var $ = require('jquery');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var BaseMapActions = require('../../actions/map/BaseMapActions'); 
var BaseMapStore = require('../../stores/map/BaseMapStore'); 

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');
var MapToolButton = require('./MapToolButton');
var MapToolPanel = require('./MapToolPanel');
var InsetMap = require('./InsetMap');
var MapboxGLHelperMixin = require('./MapboxGLHelperMixin');
var MapInteractionMixin = require('./MapInteractionMixin');
var MeasurementToolMixin = require('./MeasurementToolMixin');
var MapGeoJSONMixin = require('./MapGeoJSONMixin');
var LayerSources = require('./Sources');
var MarkerSprites = require('./MarkerSprites');

var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../assets/assets/js/mapbox-gl/mapbox-gl.js");
}

var Map = React.createClass({

  mixins:[MapboxGLHelperMixin, MapInteractionMixin, MapGeoJSONMixin, 
            MeasurementToolMixin,
            StateMixin.connect(BaseMapStore, {initWithProps: ['baseMap']}),          
            StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    maxBounds: React.PropTypes.object,
    maxZoom: React.PropTypes.number,
    minZoom: React.PropTypes.number,
    height: React.PropTypes.string,
    style: React.PropTypes.object,
    glStyle: React.PropTypes.object,
    features:  React.PropTypes.array,
    tileJSONType: React.PropTypes.string,
    tileJSONUrl:  React.PropTypes.string,
    data: React.PropTypes.object,
    interactive: React.PropTypes.bool,
    showPlayButton: React.PropTypes.bool,
    showLogo: React.PropTypes.bool,
    showFeatureInfoEditButtons: React.PropTypes.bool,
    fitBounds: React.PropTypes.array,
    disableScrollZoom: React.PropTypes.bool,
    enableRotation: React.PropTypes.bool,
    navPosition:  React.PropTypes.string,
    baseMap: React.PropTypes.string,
    onChangeBaseMap: React.PropTypes.func,
    insetMap: React.PropTypes.bool,
    hoverInteraction: React.PropTypes.bool,
    interactionBufferSize: React.PropTypes.number,
    hash: React.PropTypes.bool,
    gpxLink: React.PropTypes.string,
    attributionControl: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      maxZoom: 18,
      minZoom: 5,
      className: '',
      interactive: true,
      showFeatureInfoEditButtons: true,
      showPlayButton: true,
      navPosition: 'top-right',
      baseMap: 'default',
      showLogo: true,
      insetMap: true,
      hoverInteraction: false,
      interactionBufferSize: 10,
      hash: true,
      attributionControl: false,
      style: {}
    };
  },

  getInitialState() {
    var restoreBounds = null;
    if(this.props.fitBounds){
      restoreBounds = this.props.fitBounds;
    }
    var glStyle = null;
    var interactiveLayers = [];
    if(this.props.glStyle){
       glStyle = JSON.parse(JSON.stringify(this.props.glStyle));
      interactiveLayers = this.getInteractiveLayers(glStyle);
    }
    return {
      id: this.props.id ? this.props.id : 'map',
      selectedFeatures: null,
      selected: false,
      interactive: this.props.interactive,
      glStyle,
      interactiveLayers,
      mapLoaded: false,
      restoreBounds,
      allowLayersToMoveMap: restoreBounds ? false : true
    };
  },

  componentWillMount(){
    if(this.state.glStyle){
      var interactiveLayers = this.getInteractiveLayers(this.state.glStyle);
      this.setState({interactiveLayers});
    }
  },

  componentDidMount() {
    this.createMap();
  },

  shouldComponentUpdate(nextProps, nextState){
    //always update if there is a selection
    //avoids glitch where feature hover doesn't show
    if(this.state.selected || nextState.selected
    || this.state.selectedFeatures || nextState.selectedFeatures){
      return true;
    }

    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

  addLayers(map, glStyle){
    var _this = this;
    glStyle.layers.forEach(function(layer){
    try{
      var source = glStyle.sources[layer.source];
      if(layer.source != 'osm' && source.type === 'vector' && !source.url.startsWith('mapbox://')  ){
         LayerSources['maphubs-vector'].addLayer(layer, source, map, _this);
      } else if( LayerSources[source.type] && LayerSources[source.type].addLayer){
        //use custom driver for this source type
         LayerSources[source.type].addLayer(layer, source, map);
      }else{
        map.addLayer(layer);
      }
    }catch(err){
      debug('(' + _this.state.id + ') ' +'Failed to add layer: ' + layer.id);
      debug('(' + _this.state.id + ') ' +err);
    }
    });
  },

  removeAllLayers(prevStyle){
    var _this = this;
    if(prevStyle && prevStyle.layers){
      prevStyle.layers.forEach(function(layer){
        try{
          var source = prevStyle.sources[layer.source];
          if(layer.source != 'osm' && source.type === 'vector' && !source.url.startsWith('mapbox://')  ){
            LayerSources['maphubs-vector'].removeLayer(layer, _this.map);
          }else if( LayerSources[source.type] && LayerSources[source.type].removeLayer){
            LayerSources[source.type].removeLayer(layer, _this.map);
          }else{
            _this.map.removeLayer(layer.id);
          }
        }catch(err){
          debug('(' + _this.state.id + ') ' +'Failed to remove layer: ' + layer.id);
        }
      });
    }
  },

  removeAllSources(prevStyle){
    var _this = this;
      if(prevStyle && prevStyle.sources){
      Object.keys(prevStyle.sources).forEach(function(key) {
          try{
            if(LayerSources[prevStyle.sources[key].type] && LayerSources[prevStyle.sources[key].type].remove){
              LayerSources[prevStyle.sources[key].type].remove(key, _this.map);
            }else{
              _this.map.removeSource(key);
            }           
          }catch(err){
            debug('(' + _this.state.id + ') ' +'Failed to remove source: ' + key);
          }
      });
    }
  },

  reload(prevStyle, newStyle, baseMap=null){
    var _this = this;
    debug('(' + _this.state.id + ') ' +'reload: start');
    //clear selected when reloading
    try{
      this.clearSelection();
    }catch(err){
      debug(err);
    }

    //if no style is provided assume we are reloading the active style
    if(!prevStyle) prevStyle = this.props.glStyle;
    if(!newStyle) newStyle = prevStyle;
    this.removeAllLayers(prevStyle);
    this.removeAllSources(prevStyle);
    if(baseMap){
      debug('(' + _this.state.id + ') ' +'reload: base map');
      this.map.setStyle(baseMap);
      //map data is loaded when style.load handler is called
    }else {
      this.addMapData(this.map, newStyle, this.props.data, function(){
        debug('(' + _this.state.id + ') ' +'reload: finished adding data');
      });
    }
  },

  addMapData(map, glStyle, geoJSON, cb){
    var _this = this;
    if(glStyle && glStyle.sources){
      var sources = [];
      Object.keys(glStyle.sources).forEach(function(key) {
        var source = glStyle.sources[key];
        var type = source.type;
        var url = source.url;
        if(key != 'osm' && type === 'vector' && !url.startsWith('mapbox://')  ){
          //MapHubs Vector Source
          sources.push(LayerSources['maphubs-vector'].load(key, source, map, _this));   
        } else if(LayerSources[type]){
          //we have a custom driver for this source
          sources.push(LayerSources[type].load(key, source, map, _this));      
      }else if(type === 'raster' && !url.startsWith('mapbox://')){
        source.url = source.url.replace('{MAPHUBS_DOMAIN}', MAPHUBS_CONFIG.tileServiceUrl);
        map.addSource(key, source);
      }else {
          //just add the source as-is
          map.addSource(key, source);
        }
      });
      //once all sources are loaded then load the layers
      Promise.all(sources).then(function(){
        _this.addLayers(map, glStyle);
        cb();
      }).catch(function(err){
        debug('(' + _this.state.id + ') ' +err);
        //try to load the map anyway
        _this.addLayers(map, glStyle);
        cb();
      });
    }
    else if(geoJSON){
      _this.initGeoJSON(map, geoJSON);
      _this.setState({mapLoaded: true});
    }
    else{
      //just the base map, the map is loaded
      _this.setState({mapLoaded: true});
    }
  },

  createMap() {
    var _this = this;
    debug('(' + _this.state.id + ') ' +'Creating MapboxGL Map');
    mapboxgl.accessToken = MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN;
    BaseMapActions.getBaseMapFromName(this.state.baseMap, function(baseMap){
       
    if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
    }

    var map = new mapboxgl.Map({
      container: _this.state.id,
      style: baseMap,
      zoom: 0,
      interactive: _this.state.interactive,
      dragRotate: _this.props.enableRotation ? true : false,
      touchZoomRotate: _this.props.enableRotation ? true : false,
      center: [0,0],
      hash: _this.props.hash,
      attributionControl: _this.props.attributionControl
    });

  map.on('style.load', function() {
    debug('(' + _this.state.id + ') ' +'style.load');
    //add the omh data
    _this.addMapData(map, _this.state.glStyle, _this.props.data, function(){
      //do stuff that needs to happen after data loads
      debug('(' + _this.state.id + ') ' +'finished adding map data');
      //restore map bounds (except for geoJSON maps)
      if(!_this.props.data && _this.state.restoreBounds){
        var fitBounds = _this.state.restoreBounds;
        if(fitBounds.length > 2){
          var sw = new mapboxgl.LngLat(fitBounds[0], fitBounds[1]);
          var ne = new mapboxgl.LngLat(fitBounds[2], fitBounds[3]);
          fitBounds = new mapboxgl.LngLatBounds(sw, ne);
        }
        debug('(' + _this.state.id + ') ' +'restoring bounds: ' + _this.state.restoreBounds);
        map.fitBounds(fitBounds, {animate:false});
        if(_this.refs.insetMap){
          _this.refs.insetMap.fitBounds(fitBounds, {maxZoom: 1.8, padding: 10, animate:false});
        }     
      }
      //set locale
      if(_this.state.locale != 'en'){
        _this.changeLocale(_this.state.locale, _this.map);
        if(_this.refs.insetMap){
           _this.changeLocale(_this.state.locale, _this.refs.insetMap.getInsetMap());
        }
      }
      debug('(' + _this.state.id + ') ' +'MAP LOADED');
      _this.setState({mapLoaded: true});
    });

    //Setup inset map
    if(_this.refs.insetMap){
      if(!_this.refs.insetMap.getInsetMap()){
        _this.refs.insetMap.createInsetMap(map.getCenter(), map.getBounds(), baseMap);
      } 
      map.on('moveend', function(){
        _this.refs.insetMap.updateInsetGeomFromBounds(map.getBounds(), map.getZoom());
      });
    }
  });//end style.load

  map.on('mousemove', _this.moveHandler);
  map.on('click', _this.clickHandler);

  if(_this.state.interactive){
    map.addControl(new mapboxgl.NavigationControl(), _this.props.navPosition);
  }

  map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 175,
      unit: 'metric' //TODO: let scalebar unit be a user preference
  }), 'bottom-right');

  if(_this.props.disableScrollZoom){
    map.scrollZoom.disable();
  }

  //var Geocoder = require('mapbox-gl-geocoder');
  //map.addControl(new Geocoder({position: 'top-right'}));

  _this.map = map;
  });
  },

  componentDidUpdate(prevProps, prevState) {
    //switch to interactive
    if(this.state.interactive && !prevState.interactive){    
      this.map.addControl(new mapboxgl.Navigation(), this.props.navPosition);
      var interaction = this.map.interaction;
      interaction.enable();
      $(this.refs.basemapButton).show();
      $(this.refs.editBaseMapButton).show();
    }
    //change locale
    if(this.state.locale && (this.state.locale != prevState.locale) ){     
      this.changeLocale(this.state.locale, this.map);
      if(this.refs.insetMap){
          this.changeLocale(this.state.locale, this.refs.getInsetMap());
      }
    }
  },

  componentWillReceiveProps(nextProps){
    //debug('(' + this.state.id + ') ' +'componentWillReceiveProps');
    var _this = this;
    if(nextProps.data && this.map){
      var geoJSONData = this.map.getSource("omh-geojson");
      if(geoJSONData){
        debug('(' + this.state.id + ') ' +'update geoJSON data');
        //update existing data
        geoJSONData.setData(nextProps.data);
        this.zoomToData(nextProps.data);
      }else if(geoJSONData === undefined && this.props.data){
        //do nothing, still updating from the last prop change...
      }else {
        debug('(' + this.state.id + ') ' +'init geoJSON data');
        this.initGeoJSON(this.map, nextProps.data);
      }
    }

    var fitBoundsChanging = false;
    var bounds = null;
    var allowLayersToMoveMap = this.state.allowLayersToMoveMap;

    if(nextProps.fitBounds && !isEqual(this.props.fitBounds,nextProps.fitBounds) && this.map){
      debug('(' + this.state.id + ') ' +'FIT BOUNDS CHANGING');
      fitBoundsChanging = true;
      allowLayersToMoveMap = false;
      if(nextProps.fitBounds.length > 2){
        var sw = new mapboxgl.LngLat(nextProps.fitBounds[0], nextProps.fitBounds[1]);
        var ne = new mapboxgl.LngLat(nextProps.fitBounds[2], nextProps.fitBounds[3]);
        bounds = new mapboxgl.LngLatBounds(sw, ne);
      }else{
        bounds = nextProps.fitBounds;
      }
      debug('(' + this.state.id + ') ' +'bounds: ' + bounds);
    }

    if(nextProps.glStyle && nextProps.baseMap) {
      if(!isEqual(this.state.glStyle,nextProps.glStyle)) {
          debug('(' + this.state.id + ') ' +'glstyle changing from props');
          //** Style Changing (also reloads basemap) **/
          if(this.state.mapLoaded && !fitBoundsChanging) {
            //if fitBounds isn't changing, restore the current map position
            if(this.state.glStyle != null){
              debug('(' + this.state.id + ') ' +"restoring current map position");
              allowLayersToMoveMap = false;
            }

          }
          //clone the style object otherwise it is impossible to detect updates made to the object outside this component...      
          var prevStyle = JSON.parse(JSON.stringify(this.state.glStyle));
          var styleCopy = JSON.parse(JSON.stringify(nextProps.glStyle));
          this.setState({allowLayersToMoveMap, glStyle: styleCopy});
          BaseMapActions.setBaseMap(nextProps.baseMap);
          BaseMapActions.getBaseMapFromName(nextProps.baseMap, function(baseMapUrl){
            
            _this.reload(prevStyle, styleCopy, baseMapUrl);

            var interactiveLayers = _this.getInteractiveLayers(styleCopy);

            _this.setState({interactiveLayers});//wait to change state style until after reloaded
          });

      }else if(!isEqual(this.state.baseMap,nextProps.baseMap)) {
        //** Style Not Changing, but Base Map is Changing **/
        debug('(' + this.state.id + ') ' +"basemap changing from props");
        allowLayersToMoveMap = false;    
        this.setState({allowLayersToMoveMap});
        BaseMapActions.setBaseMap(nextProps.baseMap);
        BaseMapActions.getBaseMapFromName(nextProps.baseMap, function(baseMapUrl){
          _this.reload(_this.state.glStyle, _this.state.glStyle, baseMapUrl);
        });

      }else if(fitBoundsChanging) {
        //** just changing the fit bounds
        //in this case we can fitBounds directly since we are not waiting for the map to reload styles first
        if(bounds){
          debug('(' + this.state.id + ') ' +'only bounds changing, bounds: ' + bounds);
          if(Array.isArray(bounds) && bounds.length > 2){           
             bounds = [[bounds[0], bounds[1]], [bounds[2], bounds[3]]];
           }
           debug('(' + this.state.id + ') ' +'calling map fitBounds');
           this.map.fitBounds(bounds, {animate:false});
            if(this.refs.insetMap){
              this.refs.insetMap.fitBounds(bounds, {maxZoom: 1.8, padding: 10, animate:false});
            }
           this.setState({allowLayersToMoveMap});
        }
     }

    }else if(nextProps.glStyle
      && !isEqual(this.state.glStyle,nextProps.glStyle)){
        //** Style Changing (no basemap provided) **/
        debug('(' + this.state.id + ') ' +'glstyle changing from props (default basemap)');

        //clone the style object otherwise it is impossible to detect updates made to the object outside this component...
        let styleCopy = JSON.parse(JSON.stringify(nextProps.glStyle));
        this.reload(this.state.glStyle, styleCopy);

        var interactiveLayers = this.getInteractiveLayers(styleCopy);

        this.setState({glStyle: styleCopy, allowLayersToMoveMap, interactiveLayers}); //wait to change state style until after reloaded

    }else if(nextProps.baseMap
      && !isEqual(this.state.baseMap,nextProps.baseMap)) {
        //** Style Not Found, but Base Map is Changing **/
        debug('(' + this.state.id + ') ' +'basemap changing from props (no glstyle)');

      this.setState({allowLayersToMoveMap});
      BaseMapActions.setBaseMap(nextProps.baseMap);
      BaseMapActions.getBaseMapFromName(nextProps.baseMap, function(baseMapUrl){
        _this.reload(this.state.glStyle, this.state.glStyle, baseMapUrl);
      });

    }else if(fitBoundsChanging) {
      //** just changing the fit bounds on a map that does not have styles or basemap settings **/
      //in this case we can fitBounds directly since we are not waiting for the map to reload styles first
      if(bounds){
        debug('(' + this.state.id + ') ' +'only bounds changing');
        if(bounds._ne && bounds._sw){
         this.map.fitBounds(bounds, {animate:false});
         }else if(Array.isArray(bounds) && bounds.length > 2){
           this.map.fitBounds([[bounds[0], bounds[1]],
                         [bounds[2], bounds[3]]], {animate:false});
         }else{
           this.map.fitBounds(bounds, {animate:false});
         }
         this.setState({allowLayersToMoveMap});
      }
   }
  },

  componentWillUnmount() {
    this.map.remove();
  },

  startInteractive(){
    this.setState({interactive: true});
    if(!this.props.enableRotation){
      this.map.dragRotate.disable();
      this.map.touchZoomRotate.disableRotation();
    }
  },

  getBaseMap(){
    return this.state.baseMap;
  },

  changeBaseMap(mapName){
    debug('changing basemap to: ' + mapName);
    var _this = this;
    BaseMapActions.getBaseMapFromName(mapName, function(baseMapUrl){
      BaseMapActions.setBaseMap(mapName);
      _this.setState({allowLayersToMoveMap: false});
      _this.reload(_this.state.glStyle, _this.state.glStyle, baseMapUrl);

      if(_this.refs.insetMap){
        _this.refs.insetMap.reloadInset(baseMapUrl);
        _this.refs.insetMap.fitBounds(_this.map.getBounds(), {maxZoom: 1.8, padding: 10, animate:false});
      }
      
      if(_this.props.onChangeBaseMap){
        _this.props.onChangeBaseMap(mapName);
      }
    });
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

    var interactiveButton = '';
    if(!this.state.interactive && this.props.showPlayButton){
      interactiveButton = (
        <a onClick={this.startInteractive} className="btn-floating waves-effect waves-light"
          style={{position: 'absolute', left: '50%', bottom: '50%', backgroundColor: 'rgba(25,25,25,0.1)',  zIndex: '999'}}><i className="material-icons">play_arrow</i></a>
      );
    }

    var logo = '', children = '';
    if(this.state.mapLoaded && this.props.showLogo){
      logo = (
        <img style={{position:'absolute', left: '5px', bottom: '2px', zIndex: '1'}} width={MAPHUBS_CONFIG.logoSmallWidth} height={MAPHUBS_CONFIG.logoSmallHeight} src={MAPHUBS_CONFIG.logoSmall} alt="Logo"/>
      );      
      children = this.props.children;
    }

    var insetMap = '';
    if(this.props.insetMap){
      var bottom='5px';
      if(this.props.showLogo){
         bottom='30px';
      }
      insetMap = (<InsetMap ref="insetMap" id={this.state.id}  bottom={bottom} />);
    }

    var measurementTools = '';
    if(this.state.enableMeasurementTools){

      measurementTools= (
        <div>
          <div style={{
            position: 'absolute',
            top: '46px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#FFF',
            height:'30px',
            paddingLeft: '5px',
            paddingRight: '5px',
            borderRadius: '4px',
            zIndex: '100',
            lineHeight: '30px',
          }}>
          <span>{this.state.measurementMessage}</span>
          </div>
          <MapToolButton  top="80px" right="10px" icon="close" show={true} color="#000"
            onClick={this.stopMeasurementTool} tooltipText={this.__('Exit Measurement')} />
        </div>
      );
     
    }

    return (
      <div ref="mapcontainer" className={this.props.className} style={this.props.style}>
        <div id={this.state.id} ref="map" className={className} style={{width:'100%', height:'100%'}}>
          {insetMap}
          
          <MapToolPanel show={this.state.interactive && this.state.mapLoaded} 
          gpxLink={this.props.gpxLink}
          toggleMeasurementTools={this.toggleMeasurementTools}
          enableMeasurementTools={this.state.enableMeasurementTools}
          onChangeBaseMap={this.changeBaseMap}
           />
          {measurementTools}
          {featureBox}
          {interactiveButton}
          {children}
          {logo}
        </div>
        <MarkerSprites />
        </div>
    );
  }
});
module.exports = Map;