import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Marker from '../Marker'
import superagent from 'superagent'
import Promise from 'bluebird'
import Shortid from 'shortid'
import type { GLLayer, GLSource } from '../../../types/mapbox-gl-style'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import GJV from 'geojson-validation'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
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
const MapHubsSource = {
  async load(key: string, source: GLSource, mapComponent: any): Promise<any> {
    const map = mapComponent.map

    if (source.type === 'geojson' && source.data) {
      if (typeof source.data === 'string') {
        return superagent.get(source.data).then(
          (res) => {
            const geoJSON = res.body

            if (geoJSON.features) {
              geoJSON.features.forEach((feature, i) => {
                feature.properties.mhid = i
              })
            }

            if (source.metadata) {
              // HACK: Mapbox-gl errors on metadata in GeoJSON sources
              geoJSON.metadata = source.metadata
            } else {
              debug.log(`missing metadata for source ${key}`)
              geoJSON.metadata = {}
            }

            return mapComponent.addSource(key, {
              type: 'geojson',
              data: geoJSON,
              cluster: source.cluster ? source.cluster : false,
              clusterMaxZoom: source.clusterMaxZoom || 14,
              clusterRadius: source.clusterRadius || 50
            })
          },
          (err) => {
            debug.log('(' + mapComponent.state.id + ') ' + err)
          }
        )
      } else if (typeof source.data === 'object') {
        return mapComponent.addSource(key, {
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
          map.on('source.load', (e) => {
            if (
              e.source.id === key &&
              mapComponent.state.allowLayersToMoveMap
            ) {
              debug.log('Zooming map extent of source: ' + e.source.id)
              map.fitBounds([
                [tileJSON.bounds[0], tileJSON.bounds[1]],
                [tileJSON.bounds[2], tileJSON.bounds[3]]
              ])
            }
          })

          if (!tileJSON.metadata) {
            tileJSON.metadata = source.metadata
          }

          return mapComponent.addSource(key, tileJSON)
        },
        (err) => {
          debug.log('(' + mapComponent.state.id + ') ' + err)
        }
      )
    } else {
      // pass through the source as-is
      return mapComponent.addSource(key, source)
    }
  },

  async addLayer(
    layer: GLLayer,
    source: GLSource,
    position: number,
    mapComponent: any
  ) {
    const map = mapComponent.map
    const customImages = layer.metadata
      ? layer.metadata['maphubs:images']
      : undefined

    if (customImages) {
      await Promise.map(customImages, async (customImage) => {
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
              if (map.hasImage(customImage.name)) {
                map.removeImage(customImage.name)
              }

              map.addImage(customImage.name, img)
              debug.info('loaded image' + customImage.name)
            } catch (err) {
              debug.error(err)
            }

            resolve()
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
            if (map.hasImage(imageName)) {
              map.removeImage(imageName)
            }

            map.addImage(imageName, img)
            debug.info('loaded image ' + imageName)

            if (
              layer.metadata &&
              layer.metadata['maphubs:showBehindBaseMapLabels']
            ) {
              mapComponent.addLayerBefore(layer, 'water')
            } else {
              if (mapComponent.state.editing) {
                mapComponent.addLayerBefore(
                  layer,
                  mapComponent.getFirstDrawLayerID()
                )
              } else {
                mapComponent.addLayer(layer, position)
              }
            }

            resolve()
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
      mapComponent.addLayerBefore(layer, 'water')
    } else {
      if (mapComponent.state.editing) {
        mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
      } else {
        mapComponent.addLayer(layer, position)
      }
    }
  },

  removeLayer(layer: GLLayer, mapComponent: any) {
    mapComponent.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: any) {
    mapComponent.removeSource(key)
  }
}
export default MapHubsSource