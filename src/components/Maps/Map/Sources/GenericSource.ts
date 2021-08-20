import mapboxgl from 'mapbox-gl'
import drawTheme from '@mapbox/mapbox-gl-draw/src/lib/theme'
import { SourceWithUrl } from './types/SourceWithUrl'

import { SourceState } from './types/SourceState'

class GenericSource {
  load(key: string, source: SourceWithUrl, state: SourceState): any {
    return state.addSource(key, source)
  }

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    state: SourceState
  ): void {
    if (state.editing) {
      state.addLayerBefore(layer, drawTheme[0].id + '.cold')
    } else {
      state.addLayer(layer, position)
    }
  }

  removeLayer(
    layer: mapboxgl.Layer,
    removeLayerCallback: (id: string) => void
  ): void {
    removeLayerCallback(layer.id)
  }

  remove(key: string, removeSource: (key: string) => void): void {
    removeSource(key)
  }
}
export default GenericSource
