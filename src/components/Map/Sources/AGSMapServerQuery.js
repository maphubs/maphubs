var TerraformerGL = require('../../../services/terraformerGL.js');
var debug = require('../../../services/debug')('AGSFeatureServerQuery');
var AGSMapServerQuery = {
  load(key, source, map){
    var _this = this;
    return TerraformerGL.getArcGISGeoJSON(source.url)
      .then(function(geoJSON) {
        if(geoJSON.bbox && geoJSON.bbox.length > 0 && _this.state.allowLayersToMoveMap){
          _this.zoomToData(geoJSON);
        }
        map.addSource(key, {"type": "geojson", data: geoJSON});
      }, function(error) {
        debug('(' + _this.state.id + ') ' +error);
      });
  }
};

module.exports = AGSMapServerQuery;