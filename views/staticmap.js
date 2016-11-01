var React = require('react');
var $ = require('jquery');
var Legend = require('../components/Map/Legend');
var Map = require('../components/Map/Map');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var _debounce = require('lodash.debounce');

//A reponsive full window map used to render screenshots

var StaticMap = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    name: React.PropTypes.string,
    layers: React.PropTypes.array.isRequired,
    style: React.PropTypes.object.isRequired,
    position: React.PropTypes.object.isRequired,
    basemap: React.PropTypes.string.isRequired,
    showLegend: React.PropTypes.bool,
    showLogo: React.PropTypes.bool,
    insetMap:  React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
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
          <Legend style={{
              width: '100%'
            }}
            title={title}
              layers={this.props.layers}/>
          );
      } else {
        legend = (
          <Legend style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              zIndex: '9999',
              width: '25%'
            }}
            title={title}
              layers={this.props.layers}/>
        );
      }
    }

    var bbox = this.props.position.bbox;
    var bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
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
