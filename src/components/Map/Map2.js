//@flow
import React from 'react';
import{NavigationControl, StaticMap, InteractiveMap} from 'react-map-gl';
//import StaticMap from './react-static-map';
//import InteractiveMap from './react-interactive-map';
import MapHubsComponent from '../MapHubsComponent';

//import classNames from 'classnames';
import FeatureBox from './FeatureBox';
import BaseMapActions from '../../actions/map/BaseMapActions'; 
import BaseMapStore from '../../stores/map/BaseMapStore'; 
import DataEditorStore from '../../stores/DataEditorStore';
import _isequal from 'lodash.isequal';
import MeasurementTool from './MeasurementTool';
import MapSearchPanel from './Search/MapSearchPanel';
import MapToolPanel from './MapToolPanel';
import InsetMap from './InsetMap';
import MarkerSprites from './MarkerSprites';
import AnimationOverlay from './AnimationOverlay';
import AnimationStore from '../../stores/map/AnimationStore';
import MarkerStore from '../../stores/map/MarkerStore';
import MapboxGLHelperMixin from './Helpers/MapboxGLHelperMixin';
import MapInteractionMixin from './Helpers/MapInteractionMixin';
//import MeasurementToolMixin from './Helpers/MeasurementToolMixin';
import ForestAlertMixin from './Helpers/ForestAlertMixin';
import MapGeoJSONMixin from './Helpers/MapGeoJSONMixin';
import DataEditorMixin from './Helpers/DataEditorMixin';
import ForestLossMixin from './Helpers/ForestLossMixin';
import StyleMixin from './Helpers/StyleMixin';
import MapSearchMixin from './Search/MapSearchMixin';
import DataEditorActions from '../../actions/DataEditorActions';
import AnimationActions from '../../actions/map/AnimationActions';
import Promise from 'bluebird';
import Dimensions from 'react-dimensions';

var debug = require('../../services/debug')('map');
var $ = require('jquery');

var mapboxgl = {}, ArcGISTiledMapServiceSource, ScalePositionControl;
if (typeof window !== 'undefined') {
    mapboxgl = require("mapbox-gl");
    ArcGISTiledMapServiceSource  = require('mapbox-gl-arcgis-tiled-map-service');
    ScalePositionControl = require('mapbox-gl-dual-scale-control');
}

import type {GLStyle, GLSource, GLLayer} from '../../types/mapbox-gl-style';
import type {GeoJSONObject} from 'geojson-flow';
import type {BaseMapStoreState} from '../../stores/map/BaseMapStore';
import type {Layer} from '../../stores/layer-store';

type Viewport = {
  latitude: number, 
  longitude: number, 
  zoom: number,
  bearing?: number,
  pitch?: number
}

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
  showScale: boolean,
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
  insetConfig: Object,
  onToggleForestLoss?: Function,
  containerWidth?: number, //from HOC
  containerHeight?: number, //from HOC
  children?: any
|}

type State = {
  id: string,
  selectedFeature?: Object,
  selected: boolean,
  interactive: boolean,
  interactiveLayers: Array<GLLayer>,
  mapLoaded: boolean,
  restoreBounds?: NestedArray<number>,
  allowLayersToMoveMap: boolean,
  dragPan: boolean,
  viewport: Viewport
} & BaseMapStoreState


class Map extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps = {
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
    showScale: true,
    hoverInteraction: false,
    interactionBufferSize: 10,
    hash: true,
    attributionControl: false,
    style: {},
    allowLayerOrderOptimization: true,
    fitBoundsOptions: {animate:false},
    height: '100%',
    mapConfig: {},
    insetConfig: {}
  }

  state: State
  map: Object
  glStyle: GLStyle

  constructor(props: Props){
    super(props);

    this.stores.push(DataEditorStore);
    this.stores.push(AnimationStore);
    this.stores.push(BaseMapStore);
    this.stores.push(MarkerStore);

    DataEditorActions.onFeatureUpdate.listen(this.onFeatureUpdate);
    AnimationActions.tick.listen(this.tick);

    let restoreBounds;
    if(this.props.fitBounds){
      restoreBounds = this.props.fitBounds;
    }

    this.state = {
      id: this.props.id ? this.props.id : 'map',
      selected: false,
      interactive: this.props.interactive,
      dragPan: this.props.interactive,
      mapLoaded: false,
      restoreBounds,
      allowLayersToMoveMap: restoreBounds ? false : true,
      viewport: {
        latitude: 0, 
        longitude: 0, 
        zoom: 0
      },
      interactiveLayers: []
    };
  }

  componentWillMount(){
    var _this = this;
    super.componentWillMount();
    BaseMapActions.setBaseMap(this.props.baseMap);
    BaseMapActions.getBaseMapFromName(this.props.baseMap, (baseMap) => {
      _this.setBaseMapStyle(baseMap, false);
    });

    if(this.props.glStyle){
      var interactiveLayers = this.getInteractiveLayers(this.props.glStyle);
      this.setState({interactiveLayers});
    }

  }

  componentDidMount() {
    if(this.props.hash){
      window.addEventListener("hashchange", ()=>{
        //TODO: update viewport with new hash
      }, false);
    }
    
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if(this.props.hash){
      window.removeEventListener("hashchange", ()=>{}, false);
    }
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
      //this.map.addControl(new mapboxgl.Navigation(), this.props.navPosition);
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

  componentWillReceiveProps(nextProps: Props){
    //debug.log('(' + this.state.id + ') ' +'componentWillReceiveProps');
    var _this = this;
    if(nextProps.data && this.map){
      var geoJSONData = this.map.getSource("omh-geojson");
      if(geoJSONData){
        debug.log('(' + this.state.id + ') ' +'update geoJSON data');
        //update existing data
        geoJSONData.setData(nextProps.data);
        this.zoomToData(nextProps.data);       
       
      }else if(geoJSONData === undefined && this.props.data){
        //do nothing, still updating from the last prop change...
      }else {
        debug.log('(' + this.state.id + ') ' +'init geoJSON data');
        if(this.state.mapLoaded && nextProps.data){
          this.initGeoJSON(nextProps.data);
        }else{
          debug.log(`(${this.state.id}) Skipping GeoJSON init, map not ready yet`);
        }     
      }
    }

    var fitBoundsChanging = false;
    var bounds: any;
    var allowLayersToMoveMap = this.state.allowLayersToMoveMap;

    if(nextProps.fitBounds && !_isequal(this.props.fitBounds,nextProps.fitBounds) && this.map){
      _this.debugLog('FIT BOUNDS CHANGING');
      fitBoundsChanging = true;
      allowLayersToMoveMap = false;
      if(nextProps.fitBounds && nextProps.fitBounds.length > 2){
        bounds = [[nextProps.fitBounds[0], nextProps.fitBounds[1]], [nextProps.fitBounds[2], nextProps.fitBounds[3]]];
      }else{
        bounds = nextProps.fitBounds;
      }
      if(bounds){
        debug.log('(' + this.state.id + ') ' +'bounds: ' + bounds.toString());
      }  
    }

    if(nextProps.glStyle && nextProps.baseMap) {
      if(!_isequal(this.props.glStyle,nextProps.glStyle)) {
        _this.debugLog('glstyle changing from props');
          //** Style Changing (also reloads basemap if needed) **/
          if(this.state.mapLoaded && !fitBoundsChanging) {
            //if fitBounds isn't changing, restore the current map position
            if(this.glStyle !== null){
              this.debugLog('restoring current map position');
              allowLayersToMoveMap = false;
            }
          }
          this.setState({allowLayersToMoveMap});

          if(!_isequal(this.state.baseMap,nextProps.baseMap)) {
            BaseMapActions.setBaseMap(nextProps.baseMap);
            BaseMapActions.getBaseMapFromName(nextProps.baseMap, (baseMapStyle) => {
              _this.setBaseMapStyle(baseMapStyle, false);
            });
          }

          return Promise.resolve(_this.setOverlayStyle(nextProps.glStyle, _this.props.allowLayerOrderOptimization))
          .catch((err)=>{
            _this.debugLog(err);
          })
          .asCallback((err)=>{
            if(err){
              _this.debugLog(err);
            }
            const interactiveLayers = _this.getInteractiveLayers(nextProps.glStyle);
            _this.setState({interactiveLayers});
          });


      }else if(!_isequal(this.state.baseMap,nextProps.baseMap)) {
        //** Style Not Changing, but Base Map is Changing **/
        _this.debugLog('basemap changing from props');
        allowLayersToMoveMap = false;    
        this.setState({allowLayersToMoveMap});

        this.changeBaseMap(nextProps.baseMap);

      }else if(fitBoundsChanging) {
        //** just changing the fit bounds
        //in this case we can fitBounds directly since we are not waiting for the map to reload styles first
        if(bounds){
          _this.debugLog('only bounds changing, bounds: ' + bounds);
          if(Array.isArray(bounds) && bounds.length > 2){           
             bounds = [[bounds[0], bounds[1]], [bounds[2], bounds[3]]];
           }
           debug.log('(' + this.state.id + ') ' +'calling map fitBounds');
           this.map.fitBounds(bounds, this.props.fitBoundsOptions);

           this.setState({allowLayersToMoveMap, restoreBounds: bounds});
        }
     }

    }else if(nextProps.glStyle
      && !_isequal(this.props.glStyle,nextProps.glStyle)){
        //** Style Changing (no basemap provided) **/
        _this.debugLog('glstyle changing from props (default basemap)');
        return Promise.resolve(this.setOverlayStyle(nextProps.glStyle, _this.props.allowLayerOrderOptimization))
        .catch((err)=>{
          _this.debugLog(err);
        })
        .asCallback((err)=>{
          if(err){
            _this.debugLog(err);
          }
          var interactiveLayers = this.getInteractiveLayers(nextProps.glStyle);
          this.setState({allowLayersToMoveMap, interactiveLayers}); //wait to change state style until after reloaded
        });

    }else if(nextProps.baseMap
      && !_isequal(this.state.baseMap,nextProps.baseMap)) {
        //** Style Not Found, but Base Map is Changing **/
        _this.debugLog('basemap changing from props (no glstyle)');

      this.setState({allowLayersToMoveMap});
      BaseMapActions.setBaseMap(nextProps.baseMap);
      BaseMapActions.getBaseMapFromName(nextProps.baseMap,(baseMapStyle) => {
        _this.setBaseMapStyle(baseMapStyle, true);
      });

    }else if(fitBoundsChanging) {
      //** just changing the fit bounds on a map that does not have styles or basemap settings **/
      //in this case we can fitBounds directly since we are not waiting for the map to reload styles first
      if(bounds){
        _this.debugLog('only bounds changing');
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


  debugLog = (msg: string) => {
    debug.log(`(${this.state.id}) ${msg}`);
  }

  onStyleLoad = () => {
    var _this = this;
    let map = this.map;
    _this.debugLog('style.load');
    //restore map bounds (except for geoJSON maps)
    if(!_this.props.data && _this.state.restoreBounds){
      var fitBounds = _this.state.restoreBounds;
      if(fitBounds.length > 2){
        fitBounds = [[fitBounds[0], fitBounds[1]], [fitBounds[2], fitBounds[3]]];
      }
      debug.log('(' + _this.state.id + ') ' +'restoring bounds: ' + _this.state.restoreBounds);        
      map.fitBounds(fitBounds, _this.props.fitBoundsOptions);
      if(_this.refs.insetMap){
        _this.refs.insetMap.sync(map);
      }
    }

    //add the omh data
    _this.addMapData(map, _this.props.glStyle, _this.props.data, () => {
      //do stuff that needs to happen after data loads
      _this.debugLog('finished adding map data');

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
      
      _this.debugLog('MAP LOADED');
      _this.setState({mapLoaded: true});
    });
  }

  onMapLoad = (e: any) => {
    this.debugLog('Finish Configuring MapboxGL Map');
    var _this = this;
    const map = e.target;
    this.map = map;
    if(map){

      //alert if not supported
      if (!mapboxgl || !mapboxgl.supported || !mapboxgl.supported()) {
      alert(this.__('Your browser does not support Mapbox GL please see: http://help.maphubs.com/category/21-troubleshooting'));
      return;
      }

      if(this.state.interactive){
        map._interactive = true;
      }
     

      //add custom source types
      map.addSourceType('arcgisraster', ArcGISTiledMapServiceSource, (err) => {
        if(err){
          debug.error(err);
        }else{
          _this.debugLog('Added custom source: arcgisraster');
        }
      });

      //catch generic errors until issue with 404 tile errors is resolved
      map.on('error', (err) => {
        debug.error(err.error);
      });

      if(map.isStyleLoaded()){
        _this.onStyleLoad();
      }
      map.on('style.load', _this.onStyleLoad);//end style.load
    
       map.on('load', () => {
         $( "body" ).append( `<div id="map-load-complete" style="display: none;"></div>` );
       });
    
      //Setup inset map
        if(_this.refs.insetMap){
          if(!_this.refs.insetMap.getInsetMap()){
            BaseMapActions.getBaseMapFromName(this.props.baseMap, (baseMap) => {
              _this.refs.insetMap.createInsetMap(map.getCenter(), map.getBounds(), baseMap);
              map.on('move', () => {_this.refs.insetMap.sync(map);});
              map.on('load', () => {_this.refs.insetMap.sync(map);});
            });
          } 
        }
    
      map.on('mousemove', _this.mousemoveHandler);
      map.on('moveend', _this.moveendHandler);
      map.on('click', _this.clickHandler);
    
      if(_this.state.interactive){
        //map.addControl(new mapboxgl.NavigationControl(), _this.props.navPosition);
        map.addControl(new mapboxgl.FullscreenControl());
      }
    
      if(_this.props.attributionControl){
        map.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
      }
    
      if(_this.props.showScale){
        map.addControl(new ScalePositionControl({
            maxWidth: 175,
        }), 'bottom-right');
      }
    
      if(_this.props.disableScrollZoom){
        map.scrollZoom.disable();
      }
    
    }else{
      this.debugLog('MapboxGL Map Not Available');
    }

  }

  addMapData = (map, glStyle: Object, geoJSON?: GeoJSONObject, cb: Function) => {
    this.debugLog('addMapData');
    var _this = this;
    if(glStyle && glStyle.sources){
        return Promise.resolve(_this.setOverlayStyle(glStyle, _this.props.allowLayerOrderOptimization))
        .catch((err)=>{
          _this.debugLog(err);
        })
        .asCallback((err)=>{
          if(err){
            this.debugLog(err);
          }
          if(geoJSON){
            _this.initGeoJSON(geoJSON);
          }
        cb();
        });
    }
     else if(geoJSON){
      _this.initGeoJSON(geoJSON);
      cb();
    }else{
      cb();
    }    
  }

  getMap = () => {
    return this.refs.map.getMap();
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
    this.debugLog('changing basemap to: ' + mapName);
    var _this = this;
    BaseMapActions.getBaseMapFromName(mapName, (baseMapStyle) => {
      BaseMapActions.setBaseMap(mapName);
      _this.setState({allowLayersToMoveMap: false});
      _this.setBaseMapStyle(baseMapStyle, true);

      if(_this.refs.insetMap){
        _this.refs.insetMap.reloadInset(baseMapStyle);
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

  toggleMeasurementTools = (show: boolean) =>{
    if(show && !this.state.enableMeasurementTools){
      this.setState({enableMeasurementTools: true});
    }else if(!show && this.state.enableMeasurementTools){
      this.closeMeasurementTool();
    }
  }

  closeMeasurementTool = () =>{
    this.setState({enableMeasurementTools: false});
  }

  toggleDragPan = (dragPan: boolean) =>{
    this.setState({dragPan});
  }

  render(){
    var _this = this;

    let ReactMapGL = this.state.interactive ? InteractiveMap : StaticMap;

    //var className = classNames('mode', 'map', 'active');
    
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
          insetMap = (<InsetMap ref="insetMap" id={this.state.id}  bottom={bottom} {...this.props.insetConfig} />);
        }
    
        var measurementTools = '';
        if(this.state.enableMeasurementTools){
    
          measurementTools= (
            <MeasurementTool id={this.props.id}
            reactMap={this.refs.map}
            viewport={this.state.viewport}
            toggleDragPan={this.toggleDragPan}
            closeTool={this.closeMeasurementTool}
              />
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

    let updateViewport = function(viewport){
      const {width, height, latitude, longitude, zoom} = viewport;
      //TODO: update url hash
      _this.setState({viewport:{
        width, height, latitude, longitude, zoom
      }});
    };

    let style = this.props.style;

    if(style && !style.position){
      style.position = 'relative';
    }

    return (
      /*eslint-disable react/jsx-no-bind */
      <div ref="mapcontainer" className={this.props.className} style={style}>
        <ReactMapGL
          ref="map"
          width={this.props.containerWidth}
          height={this.props.containerHeight}
          latitude={this.state.viewport.latitude}
          longitude={this.state.viewport.longitude}
          zoom={this.state.viewport.zoom}
          mapStyle={this.glStyle}
          mapboxApiAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
          attributionControl={false}
          preserveDrawingBuffer={false}
          dragPan={this.state.dragPan}
          dragRotate={this.props.enableRotation ? true : false}
          touchZoomRotate={this.props.enableRotation ? true : false}
          scrollZoom={!this.props.disableScrollZoom}
          onViewportChange={updateViewport}
          onLoad={this.onMapLoad}
        >
        <div style={{position: 'absolute', right: '65px', top: '-5px', transform: 'rotate(-90deg)'}}>
          <NavigationControl onViewportChange={updateViewport} />
        </div>
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
          onSearchReset={this.onSearchReset}
          />
          
        </ReactMapGL>
        {measurementTools}
        <MarkerSprites />
      </div>
    );
  }

    //GeoJSONMixin
    initGeoJSON = (data: GeoJSONObject) => {
      return MapGeoJSONMixin.initGeoJSON.bind(this)(data);
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
  
    editFeature = (feature: Object) => {
      return DataEditorMixin.editFeature.bind(this)(feature);
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
  
    removeMapLayerFilters = () => {
      return DataEditorMixin.removeMapLayerFilters.bind(this)();
    }
  
    reloadEditingSourceCache = () => {
      return DataEditorMixin.reloadEditingSourceCache.bind(this)();
    }
  
    /*
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
  */
  
    //MapSearchMixin
    onSearch = (queryText: string) => {
      return MapSearchMixin.onSearch.bind(this)(queryText);
    }
  
    onSearchResultClick = (result: Object) => {
      return MapSearchMixin.onSearchResultClick.bind(this)(result);
    }
  
    getSearchDisplayLayers = (sourceID: string, source: GLSource, mhids: Array<string>) => {
      return MapSearchMixin.getSearchDisplayLayers.bind(this)(sourceID, source, mhids);
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
  
    //StyleMixin
    setBaseMapStyle = (style: GLStyle, update?: boolean) => {
      return StyleMixin.setBaseMapStyle.bind(this)(style, update);
    }
  
    setOverlayStyle = (overlayStyle: GLStyle, optimizeLayers: boolean) => {
      return StyleMixin.setOverlayStyle.bind(this)(overlayStyle, optimizeLayers);
    }
  
    reloadStyle = () => {
      return StyleMixin.reloadStyle.bind(this)();
    }
  
    addLayer = (layer: GLLayer, position?: number) => {
      return StyleMixin.addLayer.bind(this)(layer, position);
    }
  
    addLayerBefore = (layer: GLLayer, beforeLayer: string) => {
      return StyleMixin.addLayerBefore.bind(this)(layer, beforeLayer);
    }
  
    addLayers = (layerIds: Array<{id: number, position: number}>, fromStyle: GLStyle) => {
      return StyleMixin.addLayers.bind(this)(layerIds, fromStyle);
    }
  
    removeLayer = (id: string) => {
      return StyleMixin.removeLayer.bind(this)(id);
    }
  
    removeLayers = (layersIDs: Array<string>, fromStyle: GLStyle) =>{
      return StyleMixin.removeLayers.bind(this)(layersIDs, fromStyle);
    }
  
    addSource = (key: string, source: GLSource) => {
      return StyleMixin.addSource.bind(this)(key, source);
    }
  
    removeSource = (key: string) => {
      return StyleMixin.removeSource.bind(this)(key);
    }
  
    removeSources = (sourceKeys: Array<string>, fromStyle: GLStyle) => {
      return StyleMixin.removeSources.bind(this)(sourceKeys, fromStyle);
    }
  
    loadSources = async (sourceKeys: Array<string>, fromStyle: GLStyle) => {
      return StyleMixin.loadSources.bind(this)(sourceKeys, fromStyle);
    }
  

}

export default Dimensions()(Map);