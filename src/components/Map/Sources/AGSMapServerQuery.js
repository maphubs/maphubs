// @flow
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style'

const TerraformerGL = require('../../../services/terraformerGL.js')
const debug = require('../../../services/debug')('AGSFeatureServerQuery')

const AGSMapServerQuery = {
  load (key: string, source: GLSource, mapComponent: any) {
    return TerraformerGL.getArcGISGeoJSON(source.url)
      .then((geoJSON) => {
        if (geoJSON.bbox && geoJSON.bbox.length > 0 && mapComponent.state.allowLayersToMoveMap) {
          mapComponent.zoomToData(geoJSON)
        }
        return mapComponent.addSource(key, {'type': 'geojson', data: geoJSON})
      }, (error) => {
        debug.log('(' + mapComponent.state.id + ') ' + error)
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

module.exports = AGSMapServerQuery
