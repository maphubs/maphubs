import React from 'react';
import PropTypes from 'prop-types';
var $ = require('jquery');
var MiniLegend = require('../components/Map/MiniLegend');
var Map = require('../components/Map/Map');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var _debounce = require('lodash.debounce');

//A reponsive full window map used to render screenshots

var StaticMap = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    name: PropTypes.string,
    layers: PropTypes.array.isRequired,
    style: PropTypes.object.isRequired,
    position: PropTypes.object.isRequired,
    basemap: PropTypes.string.isRequired,
    showLegend: PropTypes.bool,
    showLogo: PropTypes.bool,
    insetMap:  PropTypes.bool,
    locale: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      showLegend: true,
      showLogo: true,
      insetMap: true
    };
  },

  getInitialState(){
    return {
      retina: false,
      width: 1024,
      height: 600
    };
  },

  componentWillMount(){
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
      var debounced = _debounce(function(){
        var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 2500).bind(this);
      debounced();
    });


  },

  render() {
    var map = '';
    var title = null;

    if(this.props.name && this.props.name != ''){
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
});

module.exports = StaticMap;
