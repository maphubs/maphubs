var React = require('react');

var Header = require('../components/header');

var MapMaker = require('../components/MapMaker/MapMaker');

var slug = require('slug');

var Map = React.createClass({

  propTypes: {
    popularLayers: React.PropTypes.array,
    myLayers: React.PropTypes.array
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
          <MapMaker onCreate={this.mapCreated} popularLayers={this.props.popularLayers} myLayers={this.props.myLayers} userMap/>
        </main>
      </div>
		);
	}
});

module.exports = Map;
