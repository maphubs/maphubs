import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import type { GLLayer, GLSource } from '../../../types/mapbox-gl-style'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const RasterSource = {
  async load(key: string, source: GLSource, mapComponent: any): Promise<any> {
    if (source.url) {
      source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
    }

    let connectID

    if (MAPHUBS_CONFIG && MAPHUBS_CONFIG.DG_WMS_CONNECT_ID) {
      connectID = MAPHUBS_CONFIG.DG_WMS_CONNECT_ID
    } else {
      connectID = mapComponent.props.DGWMSConnectID
    }

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
      mapComponent.map.authUrlStartsWith = source.metadata.authUrl
      mapComponent.map.authToken = source.metadata.authToken
    }

    return mapComponent.addSource(key, source)
  },

  addLayer(
    layer: GLLayer,
    source: GLSource,
    position: number,
    mapComponent: any
  ) {
    if (layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']) {
      mapComponent.addLayerBefore(layer, 'water')
    } else {
      if (mapComponent.state.editing) {
        mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
      } else {
        mapComponent.addLayer(layer, position)
      }
    }
  },

  removeLayer(layer: GLLayer, mapComponent: any): any {
    return mapComponent.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: any): any {
    return mapComponent.removeSource(key)
  }
}
export default RasterSource