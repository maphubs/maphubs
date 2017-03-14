var debug = require('../../services/debug')('MapGeoJSONMixin');
var styles = require('./styles');

var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.js");
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
      let s = bbox[0];
      if(s < -175) s = -175;
      let w = bbox[1];
      if(w < -85) w = -85;
      let n = bbox[2];
      if(n > 175) n = 175;
      let e = bbox[3];
      if(e > 85) e = 85;

      let sw = new mapboxgl.LngLat(s, w);
      let ne = new mapboxgl.LngLat(n, e);
      let llb = new mapboxgl.LngLatBounds(sw, ne);
      this.map.fitBounds(llb, {padding: 25, curve: 3, speed:0.6, maxZoom: 12});
    }  
  },

};
module.exports = MapGeoJSONMixin;