var TerraformerGL = require('../../../services/terraformerGL.js');
var debug = require('../../../services/debug')('AGSFeatureServerQuery');
var AGSMapServerQuery = {
  load(key, source, map, mapComponent){
    return TerraformerGL.getArcGISGeoJSON(source.url)
      .then((geoJSON) => {
        if(geoJSON.bbox && geoJSON.bbox.length > 0 && mapComponent.state.allowLayersToMoveMap){
          mapComponent.zoomToData(geoJSON);
        }
        map.addSource(key, {"type": "geojson", data: geoJSON});
      }, (error) => {
        debug.log('(' + mapComponent.state.id + ') ' +error);
      });
  },
  addLayer(layer, source, map, mapComponent){
    if(mapComponent.state.editing){
      map.addLayer(layer, mapComponent.getFirstDrawLayerID());
    }else{
      map.addLayer(layer);
    }
  },
  removeLayer(layer, map){
    map.removeLayer(layer.id);
  },
  remove(key, map){
    map.removeSource(key);
  }
};

module.exports = AGSMapServerQuery;