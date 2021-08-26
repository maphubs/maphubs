import mapboxgl from 'mapbox-gl'
import drawTheme from '@mapbox/mapbox-gl-draw/src/lib/theme'
import request from 'superagent'
import GenericSource from './GenericSource'

import { SourceState } from './types/SourceState'
import { SourceWithUrl } from './types/SourceWithUrl'

class MapboxSource extends GenericSource {
  mbstyle: mapboxgl.Style
  load(key: string, source: SourceWithUrl, state: SourceState): any {
    const mapboxid = source.mapboxid || ''
    const url = `https://api.mapbox.com/styles/v1/${mapboxid}?access_token=${mapComponent.props.mapboxAccessToken}`
    return request.get(url).then((res) => {
      const mbstyle = res.body
      this.mbstyle = mbstyle
      // TODO: not sure if it is possible to combine sprites/glyphs sources yet, so this doesn't work with all mapbox styles
      // add sources
      // eslint-disable-next-line unicorn/no-array-for-each
      return Object.keys(mbstyle.sources).forEach((key) => {
        const source = mbstyle.sources[key]
        state.addSource(key, source)
      })
    })
  }

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    state: SourceState
  ): void {
    // eslint-disable-next-line unicorn/no-array-for-each
    this.mbstyle.layers.forEach((mbStyleLayer: mapboxgl.Layer) => {
      if (mbStyleLayer.type !== 'background') {
        // ignore the Mapbox Studio background layer
        if (state.editing) {
          state.addLayerBefore(mbStyleLayer, drawTheme[0].id + '.cold')
        } else {
          state.addLayer(mbStyleLayer, position)
        }
      }
    })
  }

  removeLayer(
    layer: mapboxgl.Layer,
    removeLayerCallback: (id: string) => void
  ): void {
    // eslint-disable-next-line unicorn/no-array-for-each
    this.mbstyle.layers.forEach((mbStyleLayer: mapboxgl.Layer) => {
      removeLayerCallback(mbStyleLayer.id)
    })
  }

  remove(key: string, removeSource: (key: string) => void): void {
    // eslint-disable-next-line unicorn/no-array-for-each
    Object.keys(this.mbstyle.sources).forEach((mbstyleKey: string) => {
      removeSource(mbstyleKey)
    })
  }
}
export default MapboxSource
