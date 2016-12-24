var TerraformerGL = require('../../../services/terraformerGL.js');
var mapboxgl = {};
if (typeof window !== 'undefined') {
    mapboxgl = require("../../../../assets/assets/js/mapbox-gl/mapbox-gl.js");
}
var debug = require('../../../services/debug')('AGSFeatureServerQuery');
var AGSMapServerQuery = {
  load(key, source, map){
    var _this = this;
    return TerraformerGL.getArcGISGeoJSON(source.url)
      .then(function(geoJSON) {

        if(geoJSON.bbox && geoJSON.bbox.length > 0 && _this.state.allowLayersToMoveMap){
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

module.exports = AGSMapServerQuery;