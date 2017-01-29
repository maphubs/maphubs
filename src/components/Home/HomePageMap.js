var React = require('react');
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
var Map = require('../Map/Map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var HubMapLayers = require('../Hub/HubMapLayers');
var MiniLegend = require('../Map/MiniLegend');
var HubStore = require('../../stores/HubStore');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var HomePageMap = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub','layers']}), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    height: React.PropTypes.string,
    border: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      height: '300px',
      border: false
    };
  },

  componentDidMount() {
    $(this.refs.mapLayersPanel).sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });

  },

  componentDidUpdate(){
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  },

  render() {

    var border = 'none';
    if(this.props.border){
      border = '1px solid #212121';
    }

    var bounds = null;
    if(this.state.hub.map_position){
      var bbox = this.state.hub.map_position.bbox;
      bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
    }

    return (
      <div style={{width: '100%', height: this.props.height, overflow: 'hidden', border}}>
        <div className="row no-margin" style={{height: '100%'}}>
          <div style={{height: '100%', overflowY: 'auto'}} className="col no-padding s0 hide-on-small-only m3 l3">
            <HubMapLayers />
          </div>
          <div className="col s12 m9 l9 no-padding" style={{height: '100%'}}>
            <nav className="white hide-on-med-and-up"  style={{height: '0px', position: 'relative'}}>
              <a href="#" ref="mapLayersPanel"
                data-activates="map-layers"
                style={{position: 'absolute',
                  top: '110px',
                  left: '5px',
                  height:'35px',
                  lineHeight: '35px',
                  width: '35px'}}
                className="button-collapse">
                <i className="material-icons omh-btn"
                  style={{height:'35px',
                          lineHeight: '35px',
                          width: '35px',
                          fontSize:'35px'}}
                  >layers</i>
              </a>
              <div className="side-nav" id="map-layers">
                <HubMapLayers />

              </div>
            </nav>
            <Map ref="map" id="hub-map" fitBounds={bounds}
              style={{width: '100%', height: '100%'}}
              glStyle={this.state.hub.map_style}
              baseMap={this.state.hub.basemap}
              showLogo={false}
              disableScrollZoom>

              <MiniLegend style={{
                  position: 'absolute',
                  bottom: '30px',
                  right: '5px',
                  minWidth: '200px',
                  maxHeight: 'calc(100% - 80px)',
                  overflowY: 'auto',
                  zIndex: '1',
                  width: '25%'
                }} layers={this.state.layers} />
            </Map>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = HomePageMap;
