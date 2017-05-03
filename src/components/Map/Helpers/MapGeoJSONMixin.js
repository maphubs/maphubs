var debug = require('../../../services/debug')('MapGeoJSONMixin');
var styles = require('../styles');
var _bbox = require('@turf/bbox');

export default function(){
  var _this = this;
  this.initGeoJSON = (map, data) => {
    
    if(data && data.features && data.features.length > 0){
      map.addSource("omh-geojson", {"type": "geojson", data});
      var glStyle = styles.defaultStyle('geojson', null, null);
      glStyle.sources["omh-geojson"] = {"type": "geojson", data: {}}; //just a placeholder
      _this.addLayers(map, glStyle);

      var interactiveLayers = _this.getInteractiveLayers(glStyle);

      _this.setState({interactiveLayers, glStyle});
      _this.zoomToData(data);
    } else {
      //empty data
      debug(`(${this.state.id}) Empty/Missing GeoJSON Data`);
    }
  };

  /**
   * Called when clearing search
   */
  this.resetGeoJSON = () => {
    var geoJSONData = _this.map.getSource("omh-geojson");
    geoJSONData.setData({
      type: 'FeatureCollection',
      features: []
    });
    _this.map.flyTo({center: [0,0], zoom:0});
  };

  this.zoomToData = (data) => {
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

      var bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
      _this.map.fitBounds(bounds, {padding: 25, curve: 3, speed:0.6, maxZoom: 12});
    }  
  };
}