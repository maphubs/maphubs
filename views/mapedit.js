var React = require('react');

var Header = require('../components/header');

var MapMaker = require('../components/MapMaker/MapMaker');


var MapEdit = React.createClass({

  propTypes: {
    map: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    popularLayers: React.PropTypes.array.isRequired,
    myLayers: React.PropTypes.array.isRequired
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
        <Header />
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker onCreate={this.mapCreated}
            mapLayers={this.props.layers}
            basemap={this.props.map.basemap}
            mapId={this.props.map.map_id} title={this.props.map.title}
            position={this.props.map.position}
            popularLayers={this.props.popularLayers}
            myLayers={this.props.myLayers} edit/>
        </main>
      </div>
		);
	}
});

module.exports = MapEdit;
