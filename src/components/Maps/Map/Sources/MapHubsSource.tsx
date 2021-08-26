import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Marker from '../Marker'
import superagent from 'superagent'
import Shortid from 'shortid'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import GJV from 'geojson-validation'
import DebugService from '../../lib/debug'
import mapboxgl from 'mapbox-gl'
import drawTheme from '@mapbox/mapbox-gl-draw/src/lib/theme'
import Bluebird from 'bluebird'
import GenericSource from './GenericSource'

import { SourceState } from './types/SourceState'
import { SourceWithUrl } from './types/SourceWithUrl'

const debug = DebugService('MapHubsSource')
GJV.define('Position', (position: Array<number>) => {
  // the postion must be valid point on the earth, x between -180 and 180
  const errors = []

  if (position[0] < -180 || position[0] > 180) {
    errors.push('Longitude must be between -180 and 180')
  }

  if (position[1] < -90 || position[1] > 90) {
    errors.push('Latitude must be between -90 and 90')
  }

  return errors
})

/*
let mapboxgl = {}
if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl')
}
*/
class MapHubsSource extends GenericSource {
  async load(
    key: string,
    source: SourceWithUrl,
    state: SourceState
  ): Promise<any> {
    if (source.type === 'geojson' && source.data) {
      if (typeof source.data === 'string') {
        return superagent.get(source.data).then(
          (res) => {
            const geoJSON = res.body

            if (geoJSON.features) {
              for (const [i, feature] of geoJSON.features.entries()) {
                feature.properties.mhid = i
              }
            }

            if (source.metadata) {
              // HACK: Mapbox-gl errors on metadata in GeoJSON sources
              geoJSON.metadata = source.metadata
            } else {
              debug.log(`missing metadata for source ${key}`)
              geoJSON.metadata = {}
            }

            return state.addSource(key, {
              type: 'geojson',
              data: geoJSON,
              cluster: source.cluster || false,
              clusterMaxZoom: source.clusterMaxZoom || 14,
              clusterRadius: source.clusterRadius || 50
            })
          },
          (err) => {
            debug.log(err)
          }
        )
      } else if (typeof source.data === 'object') {
        return state.addSource(key, {
          type: 'geojson',
          data: source.data
        })
      }
    } else if (source.url) {
      // load as tilejson
      const url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
      return superagent.get(url).then(
        (res) => {
          const tileJSON = res.body
          tileJSON.type = 'vector'
          state.mapboxMap.on('source.load', (e) => {
            if (e.source.id === key && state.allowLayersToMoveMap) {
              debug.log('Zooming map extent of source: ' + e.source.id)
              state.mapboxMap.fitBounds([
                [tileJSON.bounds[0], tileJSON.bounds[1]],
                [tileJSON.bounds[2], tileJSON.bounds[3]]
              ])
            }
          })

          if (!tileJSON.metadata) {
            tileJSON.metadata = source.metadata
          }

          return state.addSource(key, tileJSON)
        },
        (err) => {
          debug.log(err)
        }
      )
    } else {
      // pass through the source as-is
      return state.addSource(key, source)
    }
  }

  async addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    state: SourceState
  ): Promise<void> {
    const customImages = layer.metadata
      ? layer.metadata['maphubs:images']
      : undefined

    if (customImages) {
      // eslint-disable-next-line unicorn/no-array-method-this-argument
      await Bluebird.map(customImages, async (customImage) => {
        return new Promise((resolve, reject) => {
          const width = customImage.width || 16
          const height = customImage.height || 16
          const img = new Image(width, height)
          let src = customImage.url

          if (customImage.svg) {
            src = 'data:image/svg+xml;base64,' + btoa(customImage.svg)
          }

          // eslint-disable-next-line unicorn/prefer-add-event-listener
          img.onload = () => {
            try {
              if (state.mapboxMap.hasImage(customImage.name)) {
                state.mapboxMap.removeImage(customImage.name)
              }

              state.mapboxMap.addImage(customImage.name, img)
              debug.info('loaded image' + customImage.name)
            } catch (err) {
              debug.error(err)
            }

            resolve(true)
          }

          img.setAttribute('crossOrigin', '')
          img.crossOrigin = 'Anonymous'
          img.src = src
        })
      })
    }

    // New marker support
    if (
      layer.metadata &&
      layer.metadata['maphubs:markers'] &&
      layer.metadata['maphubs:markers'].enabled
    ) {
      const markerConfig = JSON.parse(
        JSON.stringify(layer.metadata['maphubs:markers'])
      )
      const width = markerConfig.width || 16
      const height = markerConfig.height || 16
      let imageName = markerConfig.imageName

      // backwards compatibility for existing marker layers
      if (!markerConfig.version || markerConfig.version !== 2) {
        debug.info('Legacy Markers Layer')
        let offset = [0, 0]

        if (
          markerConfig.shape === 'MAP_PIN' ||
          markerConfig.shape === 'SQUARE_PIN'
        ) {
          offset = [0, -(markerConfig.height / 2)]
        }

        if (!imageName) {
          imageName = 'marker-icon-' + Shortid.generate()
        }

        const metadataClone = JSON.parse(JSON.stringify(layer.metadata))
        metadataClone['maphubs:interactive'] = true
        const newLayer = {
          id: layer.id,
          type: 'symbol',
          metadata: metadataClone,
          source: layer.source,
          'source-layer': layer['source-layer'],
          filter: layer.filter,
          layout: {
            'icon-image': imageName,
            'icon-size': 0.5,
            'icon-allow-overlap': true,
            'icon-offset': offset
          }
        }
        layer = newLayer
      }

      await new Promise((resolve, reject) => {
        // create a DOM element for the marker
        const svgString = renderToStaticMarkup(<Marker {...markerConfig} />)
        const src = `data:image/svg+xml;base64,${btoa(svgString)}`
        const img = new Image(width * 2, height * 2)

        // eslint-disable-next-line unicorn/prefer-add-event-listener
        img.onerror = (err) => {
          console.log(err)
          reject(err)
        }

        // eslint-disable-next-line unicorn/prefer-add-event-listener
        img.onload = () => {
          try {
            if (state.mapboxMap.hasImage(imageName)) {
              state.mapboxMap.removeImage(imageName)
            }

            state.mapboxMap.addImage(imageName, img)
            debug.info('loaded image ' + imageName)

            if (
              layer.metadata &&
              layer.metadata['maphubs:showBehindBaseMapLabels']
            ) {
              state.addLayerBefore(layer, 'water')
            } else {
              if (state.editing) {
                state.addLayerBefore(layer, drawTheme[0].id + '.cold')
              } else {
                state.addLayer(layer, position)
              }
            }

            resolve(true)
          } catch (err) {
            debug.error(err)
            reject(err)
          }
        }

        img.src = src
      })
    } else if (
      layer.metadata &&
      layer.metadata['maphubs:showBehindBaseMapLabels']
    ) {
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
export default MapHubsSource
