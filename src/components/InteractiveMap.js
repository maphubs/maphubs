//@flow
import React from 'react';
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
import Map from './Map/Map';
import LayerList from './MapMaker/LayerList';
import MiniLegend from './Map/MiniLegend';
import MapStore from '../stores/MapStore';
import MapActions from '../actions/MapActions';
import ForestLossLegendHelper from './Map/ForestLossLegendHelper';
import MapLayerMenu from './InteractiveMap/MapLayerMenu';
import MapHubsComponent from './MapHubsComponent';
import Reflux from './Rehydrate';
import _debounce from 'lodash.debounce';
import ShareButtons from './ShareButtons';

import type {MapStoreState} from '../stores/MapStore';

type Props = {
  map_id: number,
  title: LocalizedString,
  style: Object,
  position?: Object,
  layers?: Array<Object>,
  height: string,
  border: boolean,
  showLogo: boolean,
  disableScrollZoom: boolean,
  showTitle: boolean,
  categories?: Array<Object>,
  fitBounds: Array<number>,
  fitBoundsOptions?: Object,
  interactive: boolean,
  mapConfig: Object,
  showShareButtons: boolean,
  children?: any
}

type DefaultProps = {
  height: string,
  border: boolean,
  disableScrollZoom: boolean,
  showLogo: boolean,
  showTitle: boolean,
  interactive: boolean,
  showShareButtons: boolean
}

type State = {
  width: number,
  height: number
} & MapStoreState

export default class InteractiveMap extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
      height: '300px',
      border: false,
      disableScrollZoom: true,
      showLogo: true,
      showTitle: true,
      interactive: true,
      showShareButtons: true
  }

  state: State

  constructor(props: Props){
		super(props);
    this.stores.push(MapStore);
    Reflux.rehydrate(MapStore, {style: this.props.style, position: this.props.position, layers: this.props.layers});
	}

  componentWillMount(){
    super.componentWillMount();
    var _this = this;
    if (typeof window === 'undefined') return; //only run this on the client

    function getSize(){
      // Get the dimensions of the viewport
      var width = Math.floor($(window).width());
      var height = $(window).height();
      return {width, height};
    }

    var size = getSize();
    this.setState({
      width: size.width,
      height: size.height
    });

    $(window).resize(function(){
      var debounced = _debounce(() => {
        var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 2500).bind(this);
      debounced();
    });
  }

  componentDidMount() {   
    $(this.refs.mobileLegendPanel).sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
  }

  toggleVisibility = (layer_id: number) => {
    MapActions.toggleVisibility(layer_id, () => {});
  }

  onChangeBaseMap = (basemap: string) => {
     MapActions.changeBaseMap(basemap);
  }

  onToggleForestLoss = (enabled: boolean) => {
    var mapLayers = [];
    if(this.state.layers){
      mapLayers = this.state.layers;
    }
    var layers = ForestLossLegendHelper.getLegendLayers();
  
    if(enabled){
      //add layers to legend
       mapLayers = mapLayers.concat(layers);
    }else{
      var updatedLayers = [];
      //remove layers from legend
      mapLayers.forEach(mapLayer=>{
        var foundInLayers;
        layers.forEach(layer=>{
          if(mapLayer.id === layer.id){
            foundInLayers = true;
          }
        });
        if(!foundInLayers){
          updatedLayers.push(mapLayer);
        }
      });    
      mapLayers = updatedLayers;
    }
    MapActions.updateLayers(mapLayers, false);
  }

  getMap = () => {
    return this.refs.map;
 }
  render() {

    var border = 'none';
    if(this.props.border){
      border = '1px solid #212121';
    }

    let bounds;
    if(this.props.fitBounds){
      bounds = this.props.fitBounds;
    } else if(this.state.position){
      if(typeof window === 'undefined' || !window.location.hash){
        //only update position if there isn't absolute hash in the URL
         var bbox = this.state.position.bbox;
         bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      }
     
    }

    var children = '';
    if(this.props.children){
      children = this.props.children;
    }

    var title;
    if(this.props.showTitle && this.props.title){
      title = this.props.title;
    }

    var categoryMenu = '', height = '100%', topOffset = 0;
    if(this.props.categories){
      categoryMenu = (
        <MapLayerMenu categories={this.props.categories} 
        toggleVisibility={this.toggleVisibility}
        layers={this.state.layers} />
      );
      topOffset = 35;
      height = 'calc(100% - 35px)';
    }

     var legend = '', mobileLegend = '';
    if(this.state.width < 600){
      mobileLegend = (
        <MiniLegend style={{
            width: '100%'
          }}
          title={title}
          collapsible={false}
          mapLayersActivatesID={`map-layers-${this.props.map_id}`}
          layers={this.state.layers}/>
        );
    } else {
      let legendMaxHeight = topOffset + 185;
      legend = (
        <MiniLegend style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          minWidth: '200px',
          width: '20%'
        }} 
        maxHeight={`calc(${this.props.height} - ${legendMaxHeight}px)`} 
        layers={this.state.layers} 
        title={title} 
        mapLayersActivatesID={`map-layers-${this.props.map_id}`} />
      );
    }

    let shareButtons = '';

    if(this.props.showShareButtons){
      shareButtons = (
        <ShareButtons title={this.props.title} iconSize={24}
              style={{position: 'absolute', bottom: '5px', left: '150px', zIndex: '1'}} />
      );
    }

    let mobileLegendButtonTop = `${10 + topOffset}px`;

    return (
      <div style={{width: '100%', height: `calc(${this.props.height} - 0px)`, overflow: 'hidden', border, position: 'relative'}}>

             <a href="#" ref="mobileLegendPanel" 
            className="button-collapse hide-on-med-and-up"
              data-activates={`mobile-map-legend-${this.props.map_id}`}
              style={{position: 'absolute',
                top: mobileLegendButtonTop,
                left: '10px',
                height:'30px',
                lineHeight: '30px',
                zIndex: 1,
                textAlign: 'center',
                width: '30px'}}
              >
              <i className="material-icons z-depth-1"
                style={{height:'30px',
                        lineHeight: '30px',
                        width: '30px',
                        color: MAPHUBS_CONFIG.primaryColor,
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        borderColor: '#ddd',
                        borderStyle: 'solid',
                        borderWidth: '1px',                        
                        fontSize:'25px'}}
                >info</i>
            </a>
         
            <div className="side-nav" id={`mobile-map-legend-${this.props.map_id}`}
              style={{
                maxHeight: `calc(${this.props.height} - ${topOffset}px)`, 
                paddingBottom: '0', 
                position: 'absolute', top: `${topOffset}px`}}>
              {mobileLegend}
            </div>
          

            <div className="side-nav" id={`map-layers-${this.props.map_id}`}
            style={{height: 'auto', maxHeight: `calc(${this.props.height} - ${topOffset}px)`, paddingBottom: '0', 
              position: 'absolute', top: `${topOffset}px`}}>
              <LayerList layers={this.state.layers}
                showDesign={false} showRemove={false} showVisibility={true}
                toggleVisibility={this.toggleVisibility}
                updateLayers={MapActions.updateLayers}
                />
            </div>
            {categoryMenu}
      
            <Map ref="map" id={'map-'+ this.props.map_id} 
              fitBounds={bounds} fitBoundsOptions={this.props.fitBoundsOptions}
              height={this.props.height}
              interactive={this.props.interactive} 
              style={{width: '100%', height}}
              glStyle={this.state.style}
              baseMap={this.state.basemap}
              onChangeBaseMap={this.onChangeBaseMap}
              onToggleForestLoss={this.onToggleForestLoss}
              showLogo={this.props.showLogo}
              mapConfig={this.props.mapConfig}
              disableScrollZoom={this.props.disableScrollZoom}>
                
              {legend}
              {children}
              {shareButtons}
            </Map>

      </div>
    );
  }
}