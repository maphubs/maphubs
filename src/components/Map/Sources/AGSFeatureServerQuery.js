var TerraformerGL = require('../../../services/terraformerGL.js');
var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../../assets/assets/js/mapbox-gl/mapbox-gl.js");
}
var debug = require('../../../services/debug')('AGSFeatureServerQuery');
var AGSFeatureServerQuery = {
  load(key, source, map){
    var _this = this;
    return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url)
      .then(function(geoJSON) {

        if(geoJSON.bbox && geoJSON.bbox.length > 0 && this.state.allowLayersToMoveMap){
          _this.zoomToData(geoJSON);
        }

        var geoJSONSource = new mapboxgl.GeoJSONSource({data: geoJSON});
        map.addSource(key, geoJSONSource);
      }, function(error) {
       debug('(' + _this.state.id + ') ' +error);
      });
  },
  onStyleLoad(){

  }

};

module.exports = AGSFeatureServerQuery;