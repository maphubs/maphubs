// @flow
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style'
import type {GeoJSONObject} from 'geojson-flow'
const TerraformerGL = require('../../../services/terraformerGL.js')

const AGSFeatureServerQuery = {
  load (key: string, source: GLSource, mapComponent: any) {
    return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url)
      .then((geoJSON: GeoJSONObject) => {
        if (geoJSON.bbox && Array.isArray(geoJSON.bbox) && geoJSON.bbox.length > 0 && mapComponent.state.allowLayersToMoveMap) {
          mapComponent.zoomToData(geoJSON)
        }
        return mapComponent.addSource(key, {'type': 'geojson', data: geoJSON})
      }, (error) => {
        mapComponent.debugLog(error)
      })
  },
  addLayer (layer: GLLayer, source: GLSource, position: number, mapComponent: any) {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },
  removeLayer (layer: GLLayer, mapComponent: any) {
    mapComponent.removeLayer(layer.id)
  },
  remove (key: string, mapComponent: any) {
    mapComponent.removeSource(key)
  }
}

export default AGSFeatureServerQuery
