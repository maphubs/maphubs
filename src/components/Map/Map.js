//@flow
import React from 'react';
import Reflux from '../Rehydrate';
import classNames from 'classnames';
import FeatureBox from './FeatureBox';
import BaseMapActions from '../../actions/map/BaseMapActions'; 
import BaseMapStore from '../../stores/map/BaseMapStore'; 
import urlUtil from '../../services/url-util';
import DataEditorStore from '../../stores/DataEditorStore';
import _isequal from 'lodash.isequal';
import MapToolButton from './MapToolButton';
import MapSearchPanel from './Search/MapSearchPanel';
import MapToolPanel from './MapToolPanel';
import InsetMap from './InsetMap';
import LayerSources from './Sources';
import MarkerSprites from './MarkerSprites';
import AnimationOverlay from './AnimationOverlay';
import AnimationStore from '../../stores/map/AnimationStore';
import MarkerStore from '../../stores/map/MarkerStore';
import isEqual from 'lodash.isequal';
import Promise from 'bluebird';
import MapboxGLHelperMixin from './Helpers/MapboxGLHelperMixin';
import MapInteractionMixin from './Helpers/MapInteractionMixin';
import MeasurementToolMixin from './Helpers/MeasurementToolMixin';
import ForestAlertMixin from './Helpers/ForestAlertMixin';
import MapGeoJSONMixin from './Helpers/MapGeoJSONMixin';
import DataEditorMixin from './Helpers/DataEditorMixin';
import ForestLossMixin from './Helpers/ForestLossMixin';
import MapSearchMixin from './Search/MapSearchMixin';
import DataEditorActions from '../../actions/DataEditorActions';
import AnimationActions from '../../actions/map/AnimationActions';
import MapHubsComponent from '../MapHubsComponent';
var debug = require('../../services/debug')('map');
var $ = require('jquery');

var mapboxgl = {}, ArcGISTiledMapServiceSource, ScalePositionControl;
if (typeof window !== 'undefined') {
    mapboxgl = require("mapbox-gl");
    ArcGISTiledMapServiceSource  = require('mapbox-gl-arcgis-tiled-map-service');
    ScalePositionControl = require('mapbox-gl-dual-scale-control');
}

import type {GLStyle} from '../../types/mapbox-gl-style';
import type {GeoJSONObject} from 'geojson-flow';
import type {BaseMapStoreState} from '../../stores/map/BaseMapStore';
import type {Layer} from '../../stores/layer-store';

type Props = {|
    className: string,
    id: string,
    maxBounds?: Object,
    maxZoom?: number,
    minZoom?: number,
    height: string,
    style: Object,
    glStyle?: GLStyle,
    features?:  Array<Object>,
    tileJSONType?: string,
    tileJSONUrl?:  string,
    data?: GeoJSONObject,
    interactive: boolean,
    showPlayButton: boolean,
    showLogo: boolean,
    showFeatureInfoEditButtons: boolean,
    fitBounds?: NestedArray<number>,
    fitBoundsOptions: Object,
    disableScrollZoom?: boolean,
    enableRotation?: boolean,
    navPosition:  string,
    baseMap: string,
    onChangeBaseMap?: Function,
    insetMap: boolean,
    hoverInteraction: boolean,
    interactionBufferSize: number,
    hash: boolean,
    gpxLink?: string,
    attributionControl:boolean,
    allowLayerOrderOptimization: boolean,
    mapConfig: Object,
    onToggleForestLoss?: Function,
    children?: any
  |}

  type DefaultProps = {
    maxZoom: number,
    minZoom: number,
    className: string,
    interactive: boolean,
    showFeatureInfoEditButtons: boolean,
    showPlayButton: boolean,
    navPosition: string,
    baseMap: string,
    showLogo: boolean,
    insetMap: boolean,
    hoverInteraction: boolean,
    interactionBufferSize: number,
    hash: boolean,
    attributionControl: boolean,
    style: Object,
    allowLayerOrderOptimization: boolean,
    fitBoundsOptions: Object,
    height: string,
    mapConfig: Object
  }

  type State = {
    id: string,
    selectedFeature?: Object,
    selected: boolean,
    interactive: boolean,
    glStyle: GLStyle,
    interactiveLayers: [],
    mapLoaded: boolean,
    restoreBounds?: NestedArray<number>,
    allowLayersToMoveMap: boolean
  } & BaseMapStoreState

export default class Map extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
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
    style: {},
    allowLayerOrderOptimization: true,
    fitBoundsOptions: {animate:false},
    height: '100%',
    mapConfig: {}
  }

  state: State

  map: Object

  constructor(props: Props){
        super(props);

        this.stores.push(DataEditorStore);
        this.stores.push(AnimationStore);
        this.stores.push(BaseMapStore);
        this.stores.push( MarkerStore);
        
       Reflux.listenTo(DataEditorActions.onFeatureUpdate, 'onFeatureUpdate');
       Reflux.listenTo(AnimationActions.tick, 'tick');

      let restoreBounds;
      if(this.props.fitBounds){
        restoreBounds = this.props.fitBounds;
      }
      let glStyle: GLStyle;
      var interactiveLayers = [];
      if(this.props.glStyle){
        //TODO: why are we cloning the GLStyle?
        glStyle = (JSON.parse(JSON.stringify(this.props.glStyle)):GLStyle);
        interactiveLayers = this.getInteractiveLayers(glStyle);
      }
      this.state = {
        id: this.props.id ? this.props.id : 'map',
        selected: false,
        interactive: this.props.interactive,
        glStyle,
        interactiveLayers,
        mapLoaded: false,
        restoreBounds,
        allowLayersToMoveMap: restoreBounds ? false : true
      };
    }

  componentWillMount(){
    super.componentWillMount();
    BaseMapActions.setBaseMap(this.props.baseMap);
    if(this.state.glStyle){
      var interactiveLayers = this.getInteractiveLayers(this.state.glStyle);
      this.setState({interactiveLayers});
    }
  }

  componentDidMount() {
    this.createMap();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //always update if there is a selection
    //avoids glitch where feature hover doesn't show
    if(this.state.selected || nextState.selected
    || this.state.selectedFeature || nextState.selectedFeature){
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
  }

  componentDidUpdate(prevProps: Props, prevState: State){
    //switch to interactive
    if(this.state.interactive && !prevState.interactive){    
      this.map.addControl(new mapboxgl.Navigation(), this.props.navPosition);
      this.map.addControl(new mapboxgl.FullscreenControl(), this.props.navPosition);
      var interaction = this.map.interaction;
      interaction.enable();
      $(this.refs.basemapButton).show();
      $(this.refs.editBaseMapButton).show();
    }
    //change locale
    if(this.state.locale && (this.state.locale !== prevState.locale) ){     
      this.changeLocale(this.state.locale, this.map);
      if(this.refs.insetMap){
          this.changeLocale(this.state.locale, this.refs.insetMap.getInsetMap());
      }
    }
  }

  /**
   * Attempt to optimize layers, put labels on top of other layer types
   * @param {*} glStyle 
   */
  optimizeLayerOrder = (glStyle: Object) => {
    var regularLayers = [];
    var labelLayers = [];
    if(this.props.allowLayerOrderOptimization){
       glStyle.layers.forEach(layer=>{
         if(layer.type === 'symbol'){
           labelLayers.push(layer);
         }else{
           regularLayers.push(layer);
         }
       });
      return regularLayers.concat(labelLayers);
    }else{
      return glStyle.layers;
    }
  }

  addLayers = (map, glStyle: Object) => {
    var _this = this;
    var layers = this.optimizeLayerOrder(glStyle);
    layers.forEach((layer) => {
    try{
      var source = glStyle.sources[layer.source];
      if(layer.source !== 'osm'  && source.type === 'vector' && !source.url.startsWith('mapbox://')  ){
         LayerSources['maphubs-vector'].addLayer(layer, source, map, _this);
      }else if(source.type === 'geojson' && source.data){
         LayerSources['maphubs-vector'].addLayer(layer, source, map, _this);
      }else if( LayerSources[source.type] && LayerSources[source.type].addLayer){
        //use custom driver for this source type
         LayerSources[source.type].addLayer(layer, source, map);
      }else if(source.type === 'raster'){
        if(layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']){
          map.addLayer(layer, 'water');
        }else{
          if(_this.state.editing){
            map.addLayer(layer, _this.getFirstDrawLayerID());
          }else{
            map.addLayer(layer);
          }      
        }
      }else{
        if(_this.state.editing){
            map.addLayer(layer, _this.getFirstDrawLayerID());
          }else{
            map.addLayer(layer);
          }
      }
    }catch(err){
      debug('(' + _this.state.id + ') ' +'Failed to add layer: ' + layer.id);
      debug('(' + _this.state.id + ') ' +err);
    }
    });
  }

  removeAllLayers = (prevStyle: GLStyle) => {
    var _this = this;
    if(prevStyle && prevStyle.layers){
      prevStyle.layers.forEach((layer) => {
        try{
          let source;
          if(prevStyle.sources && layer.source){
            source = prevStyle.sources[layer.source];  
            if(layer.source !== 'osm' && source.type === 'vector' && (!source.url || !source.url.startsWith('mapbox://'))  ){
              LayerSources['maphubs-vector'].removeLayer(layer, _this.map);
            }else if(source.type === 'geojson' && source.data){
              LayerSources['maphubs-vector'].removeLayer(layer, _this.map);
            }else if( LayerSources[source.type] && LayerSources[source.type].removeLayer){
              LayerSources[source.type].removeLayer(layer, _this.map);
            }else{
              _this.map.removeLayer(layer.id);
            }
          }else{
            _this.map.removeLayer(layer.id);
          }
        }catch(err){
          debug('(' + _this.state.id + ') ' +'Failed to remove layer: ' + layer.id);
        }
      });
    }
  }

  removeAllSources = (prevStyle: GLStyle) => {
    var _this = this;
      if(prevStyle && prevStyle.sources){
      Object.keys(prevStyle.sources).forEach((key) => {
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
  }

  reload = (prevStyle: GLStyle, newStyle: GLStyle, baseMap?: string) => {
    var _this = this;
    debug('(' + _this.state.id + ') ' +'reload: start');
    //clear selected when reloading
    try{
      this.clearSelection();
    }catch(err){
      debug(err);
    }

    //if no style is provided assume we are reloading the active style
    if(!prevStyle && this.props.glStyle) prevStyle = this.props.glStyle;
    if(!newStyle) newStyle = prevStyle;
    this.removeAllLayers(prevStyle);
    this.removeAllSources(prevStyle);
    if(baseMap){
      debug('(' + _this.state.id + ') ' +'reload: base map');
      this.map.setStyle(baseMap, {diff: false}); 
      //TODO: find a way to do this without forcing a full reload
      //the problem is we currently rely on style.load to finish loading the map...
      //revist after custom sources are ready
      
      //map data is loaded when style.load handler is called
    }else {
      this.addMapData(this.map, newStyle, this.props.data, () => {
        debug('(' + _this.state.id + ') ' +'reload: finished adding data');
      });
    }
  }

  addMapData = (map, glStyle: Object, geoJSON?: GeoJSONObject, cb: Function) => {
    var _this = this;
    if(glStyle && glStyle.sources){
      var sources = [];
      Object.keys(glStyle.sources).forEach((key) => {
        var source = glStyle.sources[key];
        var type = source.type;
        var url = source.url;
        if(key !== 'osm' && type === 'vector' && !url.startsWith('mapbox://')  ){
          //MapHubs Vector Source
          sources.push(LayerSources['maphubs-vector'].load(key, source, map, _this));   
        }else if(type === 'geojson' && source.data){
          sources.push(LayerSources['maphubs-vector'].load(key, source, map, _this));  
        }else if(LayerSources[type]){
          //we have a custom driver for this source
          sources.push(LayerSources[type].load(key, source, map, _this));      
      }else if(type === 'raster'){
        if(source.url){
          source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
        }  
        map.addSource(key, source);
      }else {
          //just add the source as-is
          map.addSource(key, source);
        }
      });
      //once all sources are loaded then load the layers
      Promise.all(sources).then(() => {
        _this.addLayers(map, glStyle);
         if(geoJSON){
            _this.initGeoJSON(map, geoJSON);
          }
        cb();
      }).catch((err) => {
        debug('(' + _this.state.id + ') ' +err);
        //try to load the map anyway
        _this.addLayers(map, glStyle);
        if(geoJSON){
          _this.initGeoJSON(map, geoJSON);
        }
        cb();
      });
    }
     else if(geoJSON){
      _this.initGeoJSON(map, geoJSON);
      cb();
    }else{
      cb();
    }    
  }

  createMap = () => {
    var _this = this;
    debug('(' + _this.state.id + ') ' +'Creating MapboxGL Map');
    mapboxgl.accessToken = MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN;
    BaseMapActions.getBaseMapFromName(this.props.baseMap, (baseMap) => {
       
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
      attributionControl: false
    });

  map.addSourceType('arcgisraster', ArcGISTiledMapServiceSource, (err) => {
    if(err){
      debug(err);
    }
  });

  map.on('style.load', () => {
    debug('(' + _this.state.id + ') ' +'style.load');
    //add the omh data
    _this.addMapData(map, _this.state.glStyle, _this.props.data, () => {
      //do stuff that needs to happen after data loads
      debug('(' + _this.state.id + ') ' +'finished adding map data');
      //restore map bounds (except for geoJSON maps)
      if(!_this.props.data && _this.state.restoreBounds){
        var fitBounds = _this.state.restoreBounds;
        if(fitBounds.length > 2){
          fitBounds = [[fitBounds[0], fitBounds[1]], [fitBounds[2], fitBounds[3]]];
        }
        debug('(' + _this.state.id + ') ' +'restoring bounds: ' + _this.state.restoreBounds);        
        map.fitBounds(fitBounds, _this.props.fitBoundsOptions);
      }
      //set locale
      if(_this.state.locale !== 'en'){
        _this.changeLocale(_this.state.locale, _this.map);
        if(_this.refs.insetMap){
           _this.changeLocale(_this.state.locale, _this.refs.insetMap.getInsetMap());
        }
      }

      if(_this.state.forestAlerts){
        _this.restoreForestAlerts();
      }
      
      debug('(' + _this.state.id + ') ' +'MAP LOADED');
      _this.setState({mapLoaded: true});
    });

    //Setup inset map
    if(_this.refs.insetMap){
      if(!_this.refs.insetMap.getInsetMap()){
        _this.refs.insetMap.createInsetMap(map.getCenter(), map.getBounds(), baseMap);
        map.on('move', () => {_this.refs.insetMap.sync(map);});
      } 
    }
  });//end style.load

  map.on('mousemove', _this.mousemoveHandler);
  map.on('moveend', _this.moveendHandler);
  map.on('click', _this.clickHandler);

  if(_this.state.interactive){
    map.addControl(new mapboxgl.NavigationControl(), _this.props.navPosition);
    map.addControl(new mapboxgl.FullscreenControl());
  }

  if(_this.props.attributionControl){
    map.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
  }

  
  map.addControl(new ScalePositionControl({
      maxWidth: 175,
  }), 'bottom-right');

  if(_this.props.disableScrollZoom){
    map.scrollZoom.disable();
  }

  //var Geocoder = require('mapbox-gl-geocoder');
  //map.addControl(new Geocoder({position: 'top-right'}));

  _this.map = map;
  });
  }

  

  componentWillReceiveProps(nextProps: Props){
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
        if(this.state.mapLoaded && nextProps.data){
          this.initGeoJSON(this.map, nextProps.data);
        }else{
          debug(`(${this.state.id}) Skipping GeoJSON init, map not ready yet`);
        }
        
      }
    }

    var fitBoundsChanging = false;
    var bounds: any;
    var allowLayersToMoveMap = this.state.allowLayersToMoveMap;

    if(nextProps.fitBounds && !isEqual(this.props.fitBounds,nextProps.fitBounds) && this.map){
      debug('(' + this.state.id + ') ' +'FIT BOUNDS CHANGING');
      fitBoundsChanging = true;
      allowLayersToMoveMap = false;
      if(nextProps.fitBounds && nextProps.fitBounds.length > 2){
        bounds = [[nextProps.fitBounds[0], nextProps.fitBounds[1]], [nextProps.fitBounds[2], nextProps.fitBounds[3]]];
      }else{
        bounds = nextProps.fitBounds;
      }
      if(bounds){
        debug('(' + this.state.id + ') ' +'bounds: ' + bounds.toString());
      }  
    }

    if(nextProps.glStyle && nextProps.baseMap) {
      if(!isEqual(this.state.glStyle,nextProps.glStyle)) {
          debug('(' + this.state.id + ') ' +'glstyle changing from props');
          //** Style Changing (also reloads basemap) **/
          if(this.state.mapLoaded && !fitBoundsChanging) {
            //if fitBounds isn't changing, restore the current map position
            if(this.state.glStyle !== null){
              debug('(' + this.state.id + ') ' +"restoring current map position");
              allowLayersToMoveMap = false;
            }

          }
          //clone the style object otherwise it is impossible to detect updates made to the object outside this component...      
          var prevStyle = JSON.parse(JSON.stringify(this.state.glStyle));
          var styleCopy = JSON.parse(JSON.stringify(nextProps.glStyle));
          this.setState({allowLayersToMoveMap, glStyle: styleCopy});
          BaseMapActions.setBaseMap(nextProps.baseMap);
          BaseMapActions.getBaseMapFromName(nextProps.baseMap, (baseMapUrl) => {
            
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
        BaseMapActions.getBaseMapFromName(nextProps.baseMap, (baseMapUrl) => {
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
           this.map.fitBounds(bounds, this.props.fitBoundsOptions);

           this.setState({allowLayersToMoveMap, restoreBounds: bounds});
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
      BaseMapActions.getBaseMapFromName(nextProps.baseMap,(baseMapUrl) => {
        _this.reload(_this.state.glStyle, _this.state.glStyle, baseMapUrl);
      });

    }else if(fitBoundsChanging) {
      //** just changing the fit bounds on a map that does not have styles or basemap settings **/
      //in this case we can fitBounds directly since we are not waiting for the map to reload styles first
      if(bounds){
        debug('(' + this.state.id + ') ' +'only bounds changing');
        if(bounds._ne && bounds._sw){
         this.map.fitBounds(bounds, this.props.fitBoundsOptions);
         }else if(Array.isArray(bounds) && bounds.length > 2){
           this.map.fitBounds([[bounds[0], bounds[1]],
                         [bounds[2], bounds[3]]], this.props.fitBoundsOptions);
         }else{
           this.map.fitBounds(bounds, this.props.fitBoundsOptions);
         }
         this.setState({allowLayersToMoveMap});
      }
   }
  }

  componentWillUnmount() {
    this.map.remove();
  }

  startInteractive = () => {
    this.setState({interactive: true});
    if(!this.props.enableRotation){
      this.map.dragRotate.disable();
      this.map.touchZoomRotate.disableRotation();
    }
  }

  getBaseMap = () => {
    return this.state.baseMap;
  }

  changeBaseMap = (mapName: string) => {
    debug('changing basemap to: ' + mapName);
    var _this = this;
    BaseMapActions.getBaseMapFromName(mapName, (baseMapUrl) => {
      BaseMapActions.setBaseMap(mapName);
      _this.setState({allowLayersToMoveMap: false});
      _this.reload(_this.state.glStyle, _this.state.glStyle, baseMapUrl);

      if(_this.refs.insetMap){
        _this.refs.insetMap.reloadInset(baseMapUrl);
         _this.refs.insetMap.sync(_this.map);
      }

      if(_this.state.forestAlerts){
        _this.restoreForestAlerts();
      }
      
      if(_this.props.onChangeBaseMap){
        _this.props.onChangeBaseMap(mapName);
      }
    });
  }

  render() {

    var className = classNames('mode', 'map', 'active');

    var featureBox = '';
    if(this.state.selectedFeature){
      featureBox = (
        <FeatureBox
            feature={this.state.selectedFeature}
            selected={this.state.selected}
            onUnselected={this.handleUnselectFeature}
            showButtons={this.props.showFeatureInfoEditButtons}
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
    if(this.state.mapLoaded){
      if(this.props.showLogo){
        logo = (
          <img style={{position:'absolute', left: '5px', bottom: '2px', zIndex: '1'}} width={MAPHUBS_CONFIG.logoSmallWidth} height={MAPHUBS_CONFIG.logoSmallHeight} src={MAPHUBS_CONFIG.logoSmall} alt="Logo"/>
        );      
      }
      children = this.props.children;
    }

    var insetMap = '';
    if(this.props.insetMap){
      var bottom='25px';
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

    var animationOverlay = '';
    if(this.state.showForestLoss){
      animationOverlay = (
        <AnimationOverlay style={{
          position: 'absolute',
          bottom: '5px',
          left: '45%',
          right: '45%',
          fontSize: '32px',
          color: '#FFF',
          textShadow: '-1px 0 #000000, 0 1px #000000, 1px 0 #000000, 0 -1px #000000',
          zIndex: 1
        }} />
      );
    }

    return (
      <div ref="mapcontainer" className={this.props.className} style={this.props.style}>
        <div id={this.state.id} ref="map" className={className} style={{width:'100%', height:'100%'}}>
          {insetMap}
          
          <MapToolPanel show={this.state.interactive && this.state.mapLoaded} 
          height={this.props.height}
          gpxLink={this.props.gpxLink}
          toggleMeasurementTools={this.toggleMeasurementTools}
          enableMeasurementTools={this.state.enableMeasurementTools}
          toggleForestAlerts={this.toggleForestAlerts}
          toggleForestLoss={this.toggleForestLoss}
          calculateForestAlerts={this.calculateForestAlerts}
          forestAlerts={this.state.forestAlerts}
          onChangeBaseMap={this.changeBaseMap}
           />
          {measurementTools}
          {featureBox}
          {interactiveButton}
          {children}
          {logo}
          {animationOverlay}         
          <MapSearchPanel 
            show={this.state.interactive && this.state.mapLoaded}
            height={this.props.height} 
            onSearch={this.onSearch}
            onSearchResultClick={this.onSearchResultClick}
            />
        </div>
        <MarkerSprites />
        </div>
    );
  }

  //GeoJSONMixin
  initGeoJSON = (map: any, data: GeoJSONObject) => {
    return MapGeoJSONMixin.initGeoJSON.bind(this)(map, data);
  }

  resetGeoJSON = () => {
    return MapGeoJSONMixin.resetGeoJSON.bind(this)();
  }

  zoomToData = (data: GeoJSONObject) => {
    return MapGeoJSONMixin.zoomToData.bind(this)(data);
  }

  //MapInteractionMixin

  setSelectionFilter = (features: Array<Object>) => {
    return MapInteractionMixin.setSelectionFilter.bind(this)(features);
  }

  clearSelectionFilter = () => {
    return MapInteractionMixin.clearSelectionFilter.bind(this)();
  }

  handleUnselectFeature = () => {
    return MapInteractionMixin.handleUnselectFeature.bind(this)();
  }

  clearSelection = () => {
    return MapInteractionMixin.clearSelection.bind(this)();
  }

  getInteractiveLayers = (glStyle: GLStyle) => {
    return MapInteractionMixin.getInteractiveLayers.bind(this)(glStyle);
  }

  clickHandler = (e: any) => {
    return MapInteractionMixin.clickHandler.bind(this)(e);
  }

  moveendHandler = () => {
    return MapInteractionMixin.moveendHandler.bind(this)();
  }

  mousemoveHandler = (e: any) => {
    return MapInteractionMixin.mousemoveHandler.bind(this)(e);
  }

  //DataEditorMixin

  getFirstDrawLayerID = () => {
    return DataEditorMixin.getFirstDrawLayerID.bind(this)();
  }

  getEditorStyles = () =>{
    return DataEditorMixin.getEditorStyles.bind(this)();
  }

  startEditingTool = (layer: Layer) =>{
    return DataEditorMixin.startEditingTool.bind(this)(layer);
  }

  stopEditingTool = () => {
    return DataEditorMixin.stopEditingTool.bind(this)();
  }

  updateEdits = (e: any) => {
    return DataEditorMixin.updateEdits.bind(this)(e);
  }

  onFeatureUpdate = (type: string, feature: Object) => {
    return DataEditorMixin.onFeatureUpdate.bind(this)(type, feature);
  }

  updateMapLayerFilters = () => {
    return DataEditorMixin.updateMapLayerFilters.bind(this)();
  }

  //MeasurementToolMixin
  toggleMeasurementTools = (enable: boolean) => {
    return MeasurementToolMixin.toggleMeasurementTools.bind(this)(enable);
  }

  startMeasurementTool = () => {
    return MeasurementToolMixin.startMeasurementTool.bind(this)();
  }

  stopMeasurementTool = () => {
    return MeasurementToolMixin.stopMeasurementTool.bind(this)();
  }

  updateMeasurement = () => {
    return MeasurementToolMixin.updateMeasurement.bind(this)();
  }


  //MapSearchMixin
  onSearch = (queryText: string) => {
    return MapSearchMixin.onSearch.bind(this)(queryText);
  }

  onSearchResultClick = (result: Object) => {
    return MapSearchMixin.onSearchResultClick.bind(this)(result);
  }

  onSearchReset = () => {
    return MapSearchMixin.onSearchReset.bind(this)();
  }

  getSearchFilters = (query: string) => {
    return MapSearchMixin.getSearchFilters.bind(this)(query);
  }

  //MapboxGLHelperMixin
  getBounds = () => {
    return MapboxGLHelperMixin.getBounds.bind(this)();
  }

  getPosition = () => {
    return MapboxGLHelperMixin.getPosition.bind(this)();
  }

  updatePosition = () => {
    return MapboxGLHelperMixin.updatePosition.bind(this)();
  }

  flyTo = (center: any, zoom: number) => {
    return MapboxGLHelperMixin.flyTo.bind(this)(center, zoom);
  }

  getBoundsObject = (bbox: Array<number>) => {
    return MapboxGLHelperMixin.getBoundsObject.bind(this)(bbox);
  }

  fitBounds = (bbox: any, maxZoom: number, padding: number = 0, animate: boolean = true) => {
    return MapboxGLHelperMixin.fitBounds.bind(this)(bbox, maxZoom, padding, animate);
  }

  changeLocale = (locale: string, map: any) => {
    return MapboxGLHelperMixin.changeLocale.bind(this)(locale, map);
  }

  //ForestAlertMixin

  getDefaultForestAlertState = () => {
    return ForestAlertMixin.getDefaultForestAlertState.bind(this)();
  }

  toggleForestAlerts = (config: Object) => {
    return ForestAlertMixin.toggleForestAlerts.bind(this)(config);
  }

  restoreForestAlerts = () => {
    return ForestAlertMixin.restoreForestAlerts.bind(this)();
  }

  calculateForestAlerts = () => {
    return ForestAlertMixin.calculateForestAlerts.bind(this)();
  }

  addGLADLayer = () => {
    return ForestAlertMixin.addGLADLayer.bind(this)();
  }

  removeGLADLayer = () => {
    return ForestAlertMixin.removeGLADLayer.bind(this)();
  }

  //ForestLossMixin

  getForestLossLayer = (type: string, year: number) => {
    return ForestLossMixin.getForestLossLayer.bind(this)(type, year);
  }

  toggleForestLoss = () => {
    return ForestLossMixin.toggleForestLoss.bind(this)();
  }

  getFirstLabelLayer = () => {
    return ForestLossMixin.getFirstLabelLayer.bind(this)();
  }

  addForestLossLayers = () => {
    return ForestLossMixin.addForestLossLayers.bind(this)();
  } 

  removeForestLossLayers = () => {
    return ForestLossMixin.removeForestLossLayers.bind(this)();
  }

  tick = (year: number) => {
    return ForestLossMixin.tick.bind(this)(year);
  }


}