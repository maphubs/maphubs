import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import mapboxgl from 'mapbox-gl'
import drawTheme from '@mapbox/mapbox-gl-draw/src/lib/theme'
import GenericSource from './GenericSource'
import { SourceState } from './types/SourceState'

class RasterSource extends GenericSource {
  async load(
    key: string,
    source: mapboxgl.RasterSource & { metadata: Record<string, unknown> },
    state: SourceState
  ): Promise<any> {
    if (source.url) {
      source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
    }

    const connectID = process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID

    if (source.tiles && source.tiles.length > 0) {
      source.tiles = source.tiles.map((tile) => {
        tile = tile.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
        tile = tile.replace('{DG_WMS_CONNECT_ID}', connectID)
        return tile
      })
    }

    if (
      source.metadata &&
      source.metadata.authUrl &&
      source.metadata.authToken
    ) {
      state.mapboxMap.authUrlStartsWith = source.metadata.authUrl as string
      state.mapboxMap.authToken = source.metadata.authToken as string
    }

    return state.addSource(key, source)
  }

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    state: SourceState
  ): void {
    if (layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']) {
      state.addLayerBefore(layer, 'water')
    } else {
      if (state.editing) {
        state.addLayerBefore(layer, drawTheme[0].id + '.cold')
      } else {
        state.addLayer(layer, position)
      }
    }
  }
}
export default RasterSource
