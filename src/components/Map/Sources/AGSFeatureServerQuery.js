var TerraformerGL = require('../../../services/terraformerGL.js');
var debug = require('../../../services/debug')('AGSFeatureServerQuery');
var AGSFeatureServerQuery = {
  load(key, source, map, mapComponent){
    return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url)
      .then(function(geoJSON) {
        if(geoJSON.bbox && geoJSON.bbox.length > 0 && mapComponent.state.allowLayersToMoveMap){
          mapComponent.zoomToData(geoJSON);
        }
        map.addSource(key, {"type": "geojson", data: geoJSON});
      }, function(error) {
       debug('(' + mapComponent.state.id + ') ' +error);
      });
  }
};

module.exports = AGSFeatureServerQuery;