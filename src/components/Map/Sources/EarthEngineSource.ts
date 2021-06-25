import type { GLLayer, GLSource } from '../../../types/mapbox-gl-style'
import ee from '@google/earthengine'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const EarthEngineSource = {
  async load(key: string, source: GLSource, mapComponent: any): Promise<any> {
    const baseUrl = 'https://earthengine.googleapis.com/map'
    const image_id = source.metadata['maphubs:image_id']
    const min = source.metadata['maphubs:min']
    const max = source.metadata['maphubs:max']
    const vizParams = {}

    if (typeof min !== 'undefined') {
      vizParams.min = min
    }

    if (typeof max !== 'undefined') {
      vizParams.max = max
    }

    return new Promise((resolve, reject) => {
      const getEEMap = () => {
        ee.initialize()
        const image = ee.Image(image_id)
        const response = image.getMap(vizParams, () => {})

        if (response && response.mapid) {
          const { mapid, token } = response
          let url = [baseUrl, mapid, '{z}', '{x}', '{y}'].join('/')
          url = `${url}?token=${token}`
          resolve(
            mapComponent.addSource(key, {
              type: 'raster',
              tiles: [url]
            })
          )
        } else {
          reject(new Error('failed to load Earth Engine Map'))
        }
      }

      let clientID

      if (MAPHUBS_CONFIG && MAPHUBS_CONFIG.EARTHENGINE_CLIENTID) {
        clientID = MAPHUBS_CONFIG.EARTHENGINE_CLIENTID
      } else {
        clientID = mapComponent.props.earthEngineClientID
      }

      ee.data.authenticate(clientID, getEEMap, undefined, undefined, () => {
        ee.data.authenticateViaPopup(() => {
          getEEMap()
        })
      })
    })
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
export default EarthEngineSource