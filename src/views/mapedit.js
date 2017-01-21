var React = require('react');
var Header = require('../components/header');
var MapMaker = require('../components/MapMaker/MapMaker');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var slug = require('slug');

var MapEdit = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  propTypes: {
    map: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    popularLayers: React.PropTypes.array.isRequired,
    myLayers: React.PropTypes.array,
    myGroups: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
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
