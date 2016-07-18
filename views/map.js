var React = require('react');

var Header = require('../components/header');

var MapMaker = require('../components/MapMaker/MapMaker');

var slug = require('slug');

var Map = React.createClass({

  propTypes: {
    myLayers: React.PropTypes.array
  },

  getDefaultProps() {
    return {
      myLayers: [],
      user: {}
    };
  },

  mapCreated(map_id, title){
    window.location = '/map/'+ map_id + '/' + slug(title);
  },

	render() {
		return (
      <div>
        <Header activePage="map"/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker onCreate={this.mapCreated} userMap/>
        </main>
      </div>
		);
	}
});

module.exports = Map;
