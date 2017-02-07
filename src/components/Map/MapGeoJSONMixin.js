var debug = require('../../services/debug')('MapGeoJSONMixin');
var styles = require('./styles');

var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../assets/assets/js/mapbox-gl/mapbox-gl.js");
}
var _bbox = require('@turf/bbox');

var MapGeoJSONMixin = {

  initGeoJSON(map, data){
    if(data && data.features && data.features.length > 0){
      map.addSource("omh-geojson", {"type": "geojson", data});
      var glStyle = styles.defaultStyle('geojson', null, null);
      glStyle.sources["omh-geojson"] = {"type": "geojson", data: {}}; //just a placeholder
      this.addLayers(map, glStyle);

      var interactiveLayers = this.getInteractiveLayers(glStyle);

      this.setState({interactiveLayers, glStyle});
      this.zoomToData(data);
    } else {
      //empty data
      debug('(' + this.state.id + ') ' +'Empty/Missing GeoJSON Data');
    }
  },

  /**
   * Called when clearing search
   */
  resetGeoJSON(){
    var geoJSONData = this.map.getSource("omh-geojson");
    geoJSONData.setData({
      type: 'FeatureCollection',
      features: []
    });
    this.map.flyTo({center: [0,0], zoom:0});
  },

  zoomToData(data){
    var bbox;
    if(data.bbox && data.bbox.length > 0){
       bbox = data.bbox;      
    }else{
       bbox = _bbox(data);
    }
    if(bbox){
      let sw = new mapboxgl.LngLat(bbox[0], bbox[1]);
      let ne = new mapboxgl.LngLat(bbox[2], bbox[3]);
      let llb = new mapboxgl.LngLatBounds(sw, ne);
      this.map.fitBounds(llb, {padding: 25, curve: 3, speed:0.6, maxZoom: 12});
    }  
  },

};
module.exports = MapGeoJSONMixin;