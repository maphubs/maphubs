var React = require('react');
var Header = require('../components/header');
var MapMaker = require('../components/MapMaker/MapMaker');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var slug = require('slug');

var Map = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  propTypes: {
    popularLayers: React.PropTypes.array,
    myLayers: React.PropTypes.array,
    myGroups: React.PropTypes.array,
    editLayer: React.PropTypes.object,
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
