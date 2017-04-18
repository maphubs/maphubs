import React from 'react';
import PropTypes from 'prop-types';
var Header = require('../components/header');
var MapMaker = require('../components/MapMaker/MapMaker');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var slug = require('slug');

var MapEdit = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  propTypes: {
    map: PropTypes.object.isRequired,
    layers: PropTypes.array.isRequired,
    popularLayers: PropTypes.array.isRequired,
    myLayers: PropTypes.array,
    myGroups: PropTypes.array,
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
        <Header />
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker onCreate={this.mapCreated}
            mapLayers={this.props.layers}
            basemap={this.props.map.basemap}
            map_id={this.props.map.map_id} title={this.props.map.title}
            owned_by_group_id={this.props.map.owned_by_group_id}
            position={this.props.map.position}
            popularLayers={this.props.popularLayers}
            myLayers={this.props.myLayers}
            myGroups={this.props.myGroups}
             edit/>
        </main>
      </div>
		);
	}
});

module.exports = MapEdit;
