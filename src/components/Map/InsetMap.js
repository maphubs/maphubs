var React = require('react');
var debug = require('../../services/debug')('map');
var $ = require('jquery');
var _centroid = require('@turf/centroid');

var mapboxgl = {};

if (typeof window !== 'undefined') {
    mapboxgl = require("../../../assets/assets/js/mapbox-gl/mapbox-gl.js");
}

var InsetMap = React.createClass({

  propTypes: {
    id: React.PropTypes.string  
  },

  getDefaultProps(){
    return {
      id: 'map'
    };
  },

  componentDidMount() {   
    if(this.refs.insetMap){
      $(this.refs.insetMap).show();
    }
  },

  createInsetMap(center, bounds, baseMap) {
      var _this = this;
      var insetMap =  new mapboxgl.Map({
        container: this.props.id  + '_inset',
        style: baseMap,
        zoom: 0,
        interactive: false,
        center
      });

      insetMap.on('style.load', function() {

        insetMap.fitBounds(bounds, {maxZoom: 1.8, padding: 10});
        //create geojson from bounds
        var geoJSON = _this.getGeoJSONFromBounds(bounds);
        geoJSON.features[0].properties = {'v': 1};
        var geoJSONCentroid = _centroid(geoJSON);
        geoJSONCentroid.properties = {'v': 1};
        insetMap.addSource("inset-bounds", {"type": "geojson", data:geoJSON});
        insetMap.addSource("inset-centroid", {"type": "geojson", data:geoJSONCentroid});
        insetMap.addLayer({
            'id': 'bounds',
            'type': 'line',
            'source': 'inset-bounds',
            'paint': {
                'line-color': 'rgb(244, 118, 144)',
                'line-opacity': 0.75,
                'line-width': 5
            }
        });

        insetMap.addLayer({
            'id': 'center',
            'type': 'circle',
            'source': 'inset-centroid',
            'paint': {
                'circle-color': 'rgb(244, 118, 144)',
                'circle-opacity': 0.75
            }
        });

        if(_this.showInsetAsPoint()){
          insetMap.setFilter('center', ['==', 'v', 1]);
          insetMap.setFilter('bounds', ['==', 'v', 2]);
        } else {
          insetMap.setFilter('center', ['==', 'v', 2]);
          insetMap.setFilter('bounds', ['==', 'v', 1]);
        }

      });
      _this.insetMap = insetMap;

  },

  reloadInset(baseMapUrl){
    if(this.insetMap){
      this.insetMap.setStyle(baseMapUrl);
    } 
  },

  fitBounds(bounds, options){
    if(this.insetMap){
      this.insetMap.fitBounds(bounds, options);
    }
  },

  getInsetMap(){
    return this.insetMap;
  },

    getGeoJSONFromBounds(bounds){
    var v1 = bounds.getNorthWest().toArray();
    var v2 = bounds.getNorthEast().toArray();
    var v3 = bounds.getSouthEast().toArray();
    var v4 = bounds.getSouthWest().toArray();
    var v5 = v1;
    return {
      type: 'FeatureCollection',
      features: [{
          type: 'Feature',
          properties: {name: 'bounds'},
          geometry: {
              type: "Polygon",
              coordinates: [
                [ v1,v2,v3,v4,v5 ]
              ]
            }
      }]
    };
  },

  showInsetAsPoint(zoom){
    if(zoom && zoom > 9){
      return true;
    }
    return false;
  },

   updateInsetGeomFromBounds(bounds, zoom){
    var insetGeoJSONData = this.insetMap.getSource("inset-bounds");
    var insetGeoJSONCentroidData = this.insetMap.getSource("inset-centroid");
    if(insetGeoJSONData){
      try{
        var geoJSONBounds = this.getGeoJSONFromBounds(bounds);
        geoJSONBounds.features[0].properties = {'v': 1};
        insetGeoJSONData.setData(geoJSONBounds);
        var geoJSONCentroid = _centroid(geoJSONBounds);
        geoJSONCentroid.properties = {'v': 1};
        insetGeoJSONCentroidData.setData(geoJSONCentroid);
        this.setState({insetGeoJSONData, insetGeoJSONCentroidData});

        if(zoom < 2.3){
          this.insetMap.setFilter('center', ['==', 'v', 2]);
          this.insetMap.setFilter('bounds', ['==', 'v', 2]);
        }else if(this.showInsetAsPoint(zoom)){
          this.insetMap.setFilter('center', ['==', 'v', 1]);
          this.insetMap.setFilter('bounds', ['==', 'v', 2]);
        } else {
          this.insetMap.setFilter('center', ['==', 'v', 2]);
          this.insetMap.setFilter('bounds', ['==', 'v', 1]);
        }

        this.insetMap.fitBounds(bounds, {maxZoom: 1.8, padding: 10, animate: false});
      }catch(err){
          debug(err);
      }
    }
  },

  render(){
    return (
       <div style={{
          position: 'absolute', bottom: '30px', left: '5px',
          minHeight: '100px', maxHeight: '145px', minWidth: '100px', maxWidth: '145px',
          height: '25vw', width: '25vw'
          }}>
          <div id={this.props.id + '_inset'} ref="insetMap" className="map z-depth-1"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'none',
              border: '0.5px solid rgba(222,222,222,50)', zIndex: 1
            }}></div>
        </div>
    );
  }

});

module.exports = InsetMap;