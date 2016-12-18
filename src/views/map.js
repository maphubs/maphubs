var React = require('react');
var Header = require('../components/header');
var MapMaker = require('../components/MapMaker/MapMaker');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');

var Map = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  propTypes: {
    popularLayers: React.PropTypes.array,
    myLayers: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      popularLayers: [],
      myLayers: [],
      user: {}
    };
  },

  mapCreated(map_id, username){
    window.location = '/user/' + username + '/map/'+map_id;
  },

	render() {
		return (
      <div>
        <Header activePage="map"/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker onCreate={this.mapCreated} popularLayers={this.props.popularLayers} myLayers={this.props.myLayers} />
        </main>
      </div>
		);
	}
});

module.exports = Map;
