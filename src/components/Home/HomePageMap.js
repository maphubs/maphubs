var React = require('react');
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
var Map = require('../Map/Map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var LayerList = require('../MapMaker/LayerList');
var MiniLegend = require('../Map/MiniLegend');
var HubStore = require('../../stores/HubStore');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var HubActions = require('../../actions/HubActions');

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

  toggleVisibility(layer_id){
    HubActions.toggleVisibility(layer_id, function(){});
  },

  onChangeBaseMap(baseMap){
     HubActions.setMap(this.state.layers, this.state.hub.map_style, this.state.hub.map_position, baseMap);
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
          <div className="col s12 no-padding" style={{height: '100%'}}>
            <nav className="white"  style={{height: '0px', position: 'relative'}}>
               <a ref="mapLayersPanel"
                href="#" 
                data-activates="map-layers"
                style={{
                  display: 'inherit',
                  position: 'absolute',         
                  top: '10px',            
                  left: '10px',
                  height:'30px',
                  zIndex: '100',
                  borderRadius: '4px',
                  lineHeight: '30px',
                  textAlign: 'center',
                  boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
                  width: '30px'
                }}
                  data-position="bottom" data-delay="50" 
                  data-tooltip={this.__('Tools')}
                >
                <i  className="material-icons"
                  style={{height:'30px',
                          lineHeight: '30px',
                          width: '30px',
                          color: '#000',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: 'white',
                          borderColor: '#ddd',
                          borderStyle: 'none',
                          borderWidth: '1px',
                          textAlign: 'center',
                          fontSize:'18px'}}          
                  >layers</i>
              </a>
              <div className="side-nav" id="map-layers">
                <LayerList layers={this.state.layers}
                  showDesign={false} showRemove={false} showVisibility={true}
                  toggleVisibility={this.toggleVisibility}
                  updateLayers={HubActions.updateLayers}
                 />
              </div>
            </nav>
            <Map ref="map" id="hub-map" fitBounds={bounds}
              style={{width: '100%', height: '100%'}}
              glStyle={this.state.hub.map_style}
              baseMap={this.state.hub.basemap}
              onChangeBaseMap={this.onChangeBaseMap}
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
                  width: '20%'
                }} layers={this.state.layers} />
            </Map>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = HomePageMap;
