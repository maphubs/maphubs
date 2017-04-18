import React from 'react';
import PropTypes from 'prop-types';
var Header = require('../components/header');
var MapMaker = require('../components/MapMaker/MapMaker');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var slug = require('slug');

var Map = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  propTypes: {
    popularLayers: PropTypes.array,
    myLayers: PropTypes.array,
    myGroups: PropTypes.array,
    editLayer: PropTypes.object,
    locale: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      popularLayers: [],
      myLayers: [],
      user: {}
    };
  },

  mapCreated(map_id, title){
    window.location = '/map/view/' + map_id + '/'+ slug(title);
  },

	render() {
		return (
      <div>
        <Header activePage="map"/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker 
            onCreate={this.mapCreated} 
            popularLayers={this.props.popularLayers} 
            myLayers={this.props.myLayers} 
            myGroups={this.props.myGroups}
            editLayer={this.props.editLayer}
             />
        </main>
      </div>
		);
	}
});

module.exports = Map;
