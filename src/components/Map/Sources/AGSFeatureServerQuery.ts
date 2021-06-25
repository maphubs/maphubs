import type { GLLayer, GLSource } from '../../../types/mapbox-gl-style'
import type { GeoJSONObject } from 'geojson-flow'
import TerraformerGL from '../../../services/terraformerGL'
const AGSFeatureServerQuery = {
  load(key: string, source: GLSource, mapComponent: any): any | void {
    if (source.url) {
      return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url).then(
        (geoJSON: GeoJSONObject) => {
          if (
            geoJSON.bbox &&
            Array.isArray(geoJSON.bbox) &&
            geoJSON.bbox.length > 0 &&
            mapComponent.state.allowLayersToMoveMap
          ) {
            mapComponent.zoomToData(geoJSON)
          }

          return mapComponent.addSource(key, {
            type: 'geojson',
            data: geoJSON
          })
        },
        (err) => {
          mapComponent.debugLog(err)
        }
      )
    }
  },

  addLayer(
    layer: GLLayer,
    source: GLSource,
    position: number,
    mapComponent: any
  ) {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },

  removeLayer(layer: GLLayer, mapComponent: any) {
    mapComponent.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: any) {
    mapComponent.removeSource(key)
  }
}
export default AGSFeatureServerQuery