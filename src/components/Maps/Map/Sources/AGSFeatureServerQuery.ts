import { FeatureCollection } from 'geojson'
import mapboxgl from 'mapbox-gl'
import TerraformerGL from '../../../services/terraformerGL'
import MapComponent from '../Map'

const AGSFeatureServerQuery = {
  load(
    key: string,
    source: mapboxgl.Source,
    mapComponent: MapComponent
  ): any | void {
    if (source.url) {
      return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url).then(
        (geoJSON: FeatureCollection) => {
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
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    mapComponent: MapComponent
  ): void {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },

  removeLayer(layer: mapboxgl.Layer, mapComponent: MapComponent): void {
    mapComponent.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: MapComponent): void {
    mapComponent.removeSource(key)
  }
}
export default AGSFeatureServerQuery
