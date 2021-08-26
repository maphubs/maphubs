import ee from '@google/earthengine'
import drawTheme from '@mapbox/mapbox-gl-draw/src/lib/theme'
import mapboxgl from 'mapbox-gl'
import GenericSource from './GenericSource'

import { SourceState } from './types/SourceState'
import { SourceWithUrl } from './types/SourceWithUrl'

class EarthEngineSource extends GenericSource {
  async load(
    key: string,
    source: SourceWithUrl,
    state: SourceState
  ): Promise<any> {
    const baseUrl = 'https://earthengine.googleapis.com/map'
    const image_id = source.metadata['maphubs:image_id']
    const min = source.metadata['maphubs:min']
    const max = source.metadata['maphubs:max']
    const vizParams = {
      min: undefined,
      max: undefined
    }

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
        const response = image.getMap(vizParams, () => {
          // do nothing
        })

        if (response && response.mapid) {
          const { mapid, token } = response
          let url = [baseUrl, mapid, '{z}', '{x}', '{y}'].join('/')
          url = `${url}?token=${token}`
          resolve(
            state.addSource(key, {
              type: 'raster',
              tiles: [url]
            })
          )
        } else {
          reject(new Error('failed to load Earth Engine Map'))
        }
      }

      const clientID = process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID

      ee.data.authenticate(clientID, getEEMap, undefined, undefined, () => {
        ee.data.authenticateViaPopup(() => {
          getEEMap()
        })
      })
    })
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
export default EarthEngineSource
