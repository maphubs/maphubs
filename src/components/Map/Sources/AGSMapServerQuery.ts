import TerraformerGL from '../../../services/terraformerGL'

import DebugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import mapboxgl from 'mapbox-gl'
const debug = DebugFactory('AGSFeatureServerQuery')

const AGSMapServerQuery = {
  load(key: string, source: mapboxgl.Source, mapComponent: any): any {
    if (source.url) {
      return TerraformerGL.getArcGISGeoJSON(source.url).then(
        (geoJSON) => {
          if (
            geoJSON.bbox &&
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
          debug.log('(' + mapComponent.state.id + ') ' + err)
        }
      )
    } else {
      throw new Error('source missing url parameter')
    }
  },

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    mapComponent: any
  ): void {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },

  removeLayer(layer: mapboxgl.Layer, mapComponent: any): void {
    mapComponent.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: any): void {
    mapComponent.removeSource(key)
  }
}
export default AGSMapServerQuery
