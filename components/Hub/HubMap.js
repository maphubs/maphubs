var React = require('react');
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
var Map = require('../Map/Map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var HubActions = require('../../actions/HubActions');

var HubMapLayers = require('./HubMapLayers');
var HubMapLegend = require('./HubMapLegend');

var CreateMap = require('../CreateMap/CreateMap');
var CreateMapActions = require('../../actions/CreateMapActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var HubMap = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: React.PropTypes.object.isRequired,
    editing: React.PropTypes.bool,
    height: React.PropTypes.string,
    border: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      editing: false,
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
    window.dispatchEvent(new Event('resize'));
  },

  showMapEdit(){
    CreateMapActions.showMapDesigner();
  },

  saveMap(layers, style, position){
    HubActions.setMap(layers, style, position);
  },

  reloadMap(style){
    this.refs.map.reload(null, style);
  },

  render() {
    var mapEditButton = '', createMap = '';
    if(this.props.editing){
      createMap = (
        <CreateMap mapLayers={this.state.layers}
          showTitleEdit={false} titleLabel={this.__('Edit Hub Map')}
          onSaveHubMap={this.saveMap} hubId={this.props.hub.hub_id} hubMap/>
      );
      mapEditButton = (
        <a className="btn-floating omh-color white-text" onClick={this.showMapEdit}
          style={{position: 'absolute', top: '5px', right: '5px'}}>
          <i className="material-icons">edit</i>
        </a>
      );
    }
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
                <HubMapLayers reloadMap={this.reloadMap}/>
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
                  <HubMapLayers reloadMap={this.reloadMap}/>

                </div>

              </nav>
                <Map ref="map" id="hub-map" fitBounds={bounds} style={{width: '100%', height: '100%'}} glStyle={this.state.hub.map_style} disableScrollZoom>
                  {mapEditButton}
                  <HubMapLegend style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      minWidth: '200px',
                      zIndex: '1',
                      width: '25%'
                    }} layers={this.state.layers} />
                </Map>
              </div>
            </div>




        {createMap}
      </div>
    );
  }

});

module.exports = HubMap;
