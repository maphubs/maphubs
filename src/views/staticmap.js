//@flow
import React from 'react';
var $ = require('jquery');
import MiniLegend from '../components/Map/MiniLegend';
import Map from '../components/Map/Map';
import _debounce from 'lodash.debounce';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

//A reponsive full window map used to render screenshots
export default class StaticMap extends MapHubsComponent {

  props: {
    name: string,
    layers: Array<Object>,
    style: Object,
    position: Object,
    basemap: string,
    showLegend: boolean,
    showLogo: boolean,
    insetMap:  boolean,
    locale: string,
    _csrf: string
  }

  static defaultProps = {
    showLegend: true,
    showLogo: true,
    insetMap: true
  }

  state = {
    retina: false,
    width: 1024,
    height: 600
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
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
    var map = '';
    var title = null;

    if(this.props.name && this.props.name !== ''){
      title = this.props.name;
    }

    var legend = '', bottomLegend = '';
    if(this.props.showLegend){
      if(this.state.width < 600){
        bottomLegend = (
          <MiniLegend style={{
              width: '100%'
            }}
            title={title}
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
            title={title}
            hideInactive={false} showLayersButton={false}
              layers={this.props.layers}/>
        );
      }
    }

   
    var bounds;
    if(typeof window === 'undefined' || !window.location.hash){
        //only update position if there isn't absolute hash in the URL
          var bbox = this.props.position.bbox;
          bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      }
    map = (
      <Map ref="map" interactive={false} showPlayButton={false} fitBounds={bounds} insetMap={this.props.insetMap}
        showLogo={this.props.showLogo} style={{width: '100%', height: this.state.height + 'px'}}
        glStyle={this.props.style} baseMap={this.props.basemap} navPosition="top-right">
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