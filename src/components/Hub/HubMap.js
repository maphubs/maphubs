import React from 'react';
import PropTypes from 'prop-types';
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
var InteractiveMap = require('../InteractiveMap');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var HubActions = require('../../actions/HubActions');
var AddMapModal = require('../Story/AddMapModal');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var HubMap = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    height: PropTypes.string,
    border: PropTypes.bool,
    myMaps: PropTypes.array,
    popularMaps: PropTypes.array
  },

  getDefaultProps(){
    return {
      editing: false,
      height: '300px',
      border: false,
      myMaps: [],
      popularMaps: []
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

  onSetMap(map){
    HubActions.setMap(map);
  },

  showMapSelection(){
    this.refs.addmap.show();
  },

  render() {

    //TODO: if map is set, show the map, otherwise show instruction to set a map

    var mapEditButton = '', selectMap = '';
    if(this.props.editing){
      selectMap = (
         <AddMapModal ref="addmap"
         onAdd={this.onSetMap} onClose={this.onMapCancel}
         myMaps={this.props.myMaps} popularMaps={this.props.popularMaps} />
      );
      if(this.state.map){
         mapEditButton = (
          <a className="btn omh-color white-text" onClick={this.showMapSelection}
            style={{position: 'absolute', top: '5px', left: '45%'}}>
            {this.__('Change Map')}
          </a>
        );
      }else{
       mapEditButton = (
        <a className="btn omh-color white-text" onClick={this.showMapSelection}
          style={{position: 'absolute', top: '45%', left: '45%'}}>
          {this.__('Select a Map')}
        </a>
      );
      }
     
    }
 
    return (
      <div style={{width: '100%', height: this.props.height, overflow: 'hidden'}}>
        <div className="row no-margin" style={{height: '100%', position: 'relative'}}>

          <InteractiveMap {...this.state.map} 
            height={this.props.height} showTitle={false}
            layers={this.state.layers} />
          
            {mapEditButton}

        </div>
        {selectMap}
      </div>
    );
  }

});

module.exports = HubMap;
