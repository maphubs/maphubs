//@flow
var debug = require('../../../services/debug')('MapGeoJSONMixin');
var MapStyles = require('../Styles');
var _bbox = require('@turf/bbox');

import type {GeoJSONObject} from 'geojson-flow';

module.exports = {
  initGeoJSON(map: any, data: GeoJSONObject){
    
    if(data && data.features && Array.isArray( data.features) && data.features.length > 0){
      map.addSource("omh-geojson", {"type": "geojson", data});
      var glStyle = MapStyles.style.defaultStyle('geojson', null, null);
      glStyle.sources["omh-geojson"] = {"type": "geojson", data: {}}; //just a placeholder
      this.addLayers(map, glStyle);

      var interactiveLayers = this.getInteractiveLayers(glStyle);

      this.setState({interactiveLayers, glStyle});
      this.zoomToData(data);
    } else {
      //empty data
      debug(`(${this.state.id}) Empty/Missing GeoJSON Data`);
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

  zoomToData(data: GeoJSONObject){
    var bbox: Array<number>;
    if(data.bbox && Array.isArray(data.bbox) && data.bbox.length > 0){
       bbox = (data.bbox: Array<number>) ;      
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

      var bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
      this.map.fitBounds(bounds, {padding: 25, curve: 3, speed:0.6, maxZoom: 12});
    }  
  }
};