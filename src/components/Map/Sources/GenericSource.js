// @flow
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style'
const GenericSource = {
  load (key: string, source: GLSource, mapComponent: any): any {
    return mapComponent.addSource(key, source)
  },
  addLayer (layer: GLLayer, source: GLSource, position: number, mapComponent: any) {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },
  removeLayer (layer: GLLayer, mapComponent: any) {
    mapComponent.removeLayer(layer)
  },
  remove (key: string, mapComponent: any): any {
    return mapComponent.removeSource(key)
  }
}

export default GenericSource
