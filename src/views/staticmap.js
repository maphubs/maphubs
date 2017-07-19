//@flow
import React from 'react';
var $ = require('jquery');
import MiniLegend from '../components/Map/MiniLegend';
import Map from '../components/Map/Map';
import _debounce from 'lodash.debounce';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import BaseMapStore from '../stores/map/BaseMapStore';

type Props = {
  name: LocalizedString,
  layers: Array<Object>,
  style: Object,
  position: Object,
  basemap: string,
  showLegend: boolean,
  showLogo: boolean,
  insetMap:  boolean,
  locale: string,
  _csrf: string,
  settings: Object,
  mapConfig: Object
}

type DefaultProps = {
  showLegend: boolean,
  showLogo: boolean,
  insetMap:  boolean,
  settings: Object
}

type State = {
  retina: boolean,
  width: number,
  height: number
}

//A reponsive full window map used to render screenshots
export default class StaticMap extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps = {
    showLegend: true,
    showLogo: true,
    insetMap: true,
    settings: {}
  }

  state = {
    retina: false,
    width: 1024,
    height: 600
  }

  constructor(props: Props) {
    super(props);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
  }

  componentWillMount(){
    super.componentWillMount();
    var _this = this;
    if (typeof window === 'undefined') return; //only run this on the client

    function getSize(){
      // Get the dimensions of the viewport
      var width = Math.floor($(window).width());
      var height = $(window).height();
      //var height = Math.floor(width * 0.75); //4:3 aspect ratio
      //var height = Math.floor((width * 9)/16); //16:9 aspect ratio
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

  render() {
    var map = '', legend = '', bottomLegend = '';
    if(this.props.showLegend){
      if(this.state.width < 600){
        bottomLegend = (
          <MiniLegend style={{
              width: '100%'
            }}
            collapsible={false}
            title={this.props.name}
            hideInactive={false} showLayersButton={false}
              layers={this.props.layers}/>
          );
      } else {
        legend = (
          <MiniLegend style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              width: '25%'
            }}
            collapsible={false}
            title={this.props.name}
            hideInactive={false} showLayersButton={false}
              layers={this.props.layers}/>
        );
      }
    }

   
    var bounds;
    if(typeof window === 'undefined' || !window.location.hash){
        //only update position if there isn't absolute hash in the URL
          if(this.props.position && this.props.position.bbox){
            var bbox = this.props.position.bbox;
            bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
          }        
      }
  let insetConfig = {};
  if(this.props.settings && this.props.settings.insetConfig){
    insetConfig = this.props.settings.insetConfig;
  }
  insetConfig.collapsible = false;

    map = (
      <Map ref="map" 
        id="static-map"
        interactive={false} 
        showPlayButton={false} 
        fitBounds={bounds} 
        insetMap={this.props.insetMap}
        insetConfig={this.props.settings.insetConfig}
        showLogo={this.props.showLogo} style={{width: '100%', height: this.state.height + 'px'}}
        glStyle={this.props.style} 
        mapConfig={this.props.mapConfig}
        baseMap={this.props.basemap} navPosition="top-right">
        {legend}
      </Map>
    );

    return (
      <div className="embed-map">
        {map}
        {bottomLegend}
      </div>
    );
  }
}