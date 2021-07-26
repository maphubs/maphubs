import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import mapboxgl from 'mapbox-gl'

const RasterSource = {
  async load(
    key: string,
    source: mapboxgl.Source,
    mapComponent: any
  ): Promise<any> {
    if (source.url) {
      source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
    }

    let connectID

    connectID =
      MAPHUBS_CONFIG && process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID
        ? process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID
        : mapComponent.props.DGWMSConnectID

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
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    mapComponent: any
  ): void {
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

  removeLayer(layer: mapboxgl.Layer, mapComponent: any): any {
    return mapComponent.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: any): any {
    return mapComponent.removeSource(key)
  }
}
export default RasterSource
