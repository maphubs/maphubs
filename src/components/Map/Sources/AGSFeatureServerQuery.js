//@flow
var TerraformerGL = require('../../../services/terraformerGL.js');
var debug = require('../../../services/debug')('AGSFeatureServerQuery');

import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style';
import type {GeoJSONObject} from 'geojson-flow';
var AGSFeatureServerQuery = {
  load(key: string, source: GLSource, map: any, mapComponent: any){
    return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url)
      .then((geoJSON: GeoJSONObject) => {
        if(geoJSON.bbox && Array.isArray(geoJSON.bbox) && geoJSON.bbox.length > 0 && mapComponent.state.allowLayersToMoveMap){
          mapComponent.zoomToData(geoJSON);
        }
        map.addSource(key, {"type": "geojson", data: geoJSON});
      }, (error) => {
       debug('(' + mapComponent.state.id + ') ' +error);
      });
  },
  addLayer(layer: GLLayer, source: GLSource, map: any, mapComponent: any){
    if(mapComponent.state.editing){
      map.addLayer(layer, mapComponent.getFirstDrawLayerID());
    }else{
      map.addLayer(layer);
    }
  },
  removeLayer(layer: GLLayer, map: any){
    map.removeLayer(layer.id);
  },
  remove(key: string, map: any){
    map.removeSource(key);
  }
};

module.exports = AGSFeatureServerQuery;