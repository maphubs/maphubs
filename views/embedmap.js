var React = require('react');
var $ = require('jquery');
var Legend = require('../components/Map/Legend');
var Map = require('../components/Map/Map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var EmbedMap = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    map: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    isStatic: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      isStatic: false
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
    function isRetinaDisplay() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            return (mq && mq.matches || (window.devicePixelRatio > 1));
        }
    }
    //detect retina
    var retina = false;
    if (isRetinaDisplay()){
      retina = true;
    }

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
      retina,
      width: size.width,
      height: size.height
    });

    $(window).resize(function(){
      var size = getSize();
      _this.setState({
        width: size.width,
        height: size.height
      });
    });


  },

  render() {
    var map = '';

    var legendHeight = 14 + (this.props.layers.length * 36);
    var mapHeight = this.state.height;

    var legend = '', bottomLegend = '';
    if(this.state.width < 600){
      mapHeight = mapHeight - legendHeight;
      bottomLegend = (
        <Legend style={{
            width: '100%'
          }}
            layers={this.props.layers}/>
        );
    } else {
      if(this.props.isStatic){
        legend = (
          <Legend showIcons={false} style={{
              position: 'absolute',
              bottom: '15px',
              right: '25px',
              minWidth: '275px',
              zIndex: '9999',
              width: '25%'
            }}
              layers={this.props.layers}/>
        );
      }else{
        legend = (
          <Legend style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              minWidth: '275px',
              zIndex: '9999',
              width: '25%'
            }}
              layers={this.props.layers}/>
        );
      }

    }



    if(this.props.isStatic){
      map = (
          <div style={{position: 'relative'}}>
          <img src={this.state.imgURL} alt="Map" width={this.state.width} height={this.state.height} />
          {legend}
          <img style={{position:'absolute', left: '5px', bottom: '10px', zIndex: '998'}} width="70" height="19" src="/assets/maphubs-logo.png" alt={this.__('MapHubs Logo')}/>
          </div>
    );
    }else {
      var bbox = this.props.map.position.bbox;
      var bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      map = (
        <Map ref="map" interactive={false} fitBounds={bounds} style={{width: '100%', height: mapHeight + 'px'}} glStyle={this.props.map.style} navPosition="top-right" disableScrollZoom>
          {legend}
        </Map>
      );
    }
    return (
      <div className="embed-map">
        {map}
        {bottomLegend}
      </div>
    );
  }
});

module.exports = EmbedMap;
