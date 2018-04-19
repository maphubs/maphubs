// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import Marker from '../Marker'
import superagent from 'superagent'
import MarkerActions from '../../../actions/map/MarkerActions'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style'
import urlUtil from '../../../services/url-util'
import {checkClientError} from '../../../services/client-error-response'
import $ from 'jquery'
import GJV from 'geojson-validation'
import DebugService from '../../../services/debug'
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

let mapboxgl = {}
if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl')
}

const MapHubsSource = {
  async load (key: string, source: GLSource, mapComponent: any) {
    const map = mapComponent.map
    if (source.type === 'geojson' && source.data) {
      if (typeof source.data === 'string') {
        return superagent.get(source.data)
          .then((res) => {
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
          }, (error) => {
            debug.log('(' + mapComponent.state.id + ') ' + error)
          })
      } else if (typeof source.data === 'object') {
        return mapComponent.addSource(key, {
          type: 'geojson',
          data: source.data
        })
      }
    } else {
      // load as tilejson
      let url
      if (source.url) {
        url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
      }
      return superagent.get(url)
        .then((res) => {
          const tileJSON = res.body
          tileJSON.type = 'vector'

          map.on('source.load', (e) => {
            if (e.source.id === key && mapComponent.state.allowLayersToMoveMap) {
              debug.log('Zooming map extent of source: ' + e.source.id)
              map.fitBounds([[tileJSON.bounds[0], tileJSON.bounds[1]],
                [tileJSON.bounds[2], tileJSON.bounds[3]]])
            }
          })
          if (!tileJSON.metadata) {
            tileJSON.metadata = source.metadata
          }
          return mapComponent.addSource(key, tileJSON)
        }, (error) => {
          debug.log('(' + mapComponent.state.id + ') ' + error)
        })
    }
  },
  addLayer (layer: GLLayer, source: GLSource, position: number, mapComponent: any) {
    const map = mapComponent.map

    const presets = source.metadata ? source.metadata['maphubs:presets'] : undefined

    // try to delete any old markers
    if (layer.metadata && layer.metadata['maphubs:markers']) {
      const layer_id = layer.metadata['maphubs:layer_id']
      $('.maphubs-marker-' + layer_id).each((i, markerDiv) => {
        ReactDOM.unmountComponentAtNode(markerDiv)
        $(markerDiv).remove()
      })
      if (MarkerActions.removeLayer) {
        MarkerActions.removeLayer(layer_id)
      }
    }

    if (layer.metadata &&
      layer.metadata['maphubs:markers'] &&
      layer.metadata['maphubs:markers'].enabled &&
      !(layer.layout && layer.layout.visibility && layer.layout.visibility === 'none')
    ) {
      const markerConfig = JSON.parse(JSON.stringify(layer.metadata['maphubs:markers']))
      markerConfig.dataUrl = markerConfig.dataUrl.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
      const layer_id = layer.metadata['maphubs:layer_id']
      let shortid
      if (layer.metadata['maphubs:globalid']) {
        shortid = layer.metadata['maphubs:globalid']
      } else {
        shortid = layer_id
      }

      // load geojson for this layer
      let geojsonUrl = markerConfig.dataUrl
      if (source.type === 'geojson') {
        geojsonUrl = source.data
      }

      const createMarkersFromGeoJSON = function (geojson) {
      // add markers to map
        geojson.features.forEach((marker, i) => {
          GJV.isFeature(marker, (valid, errs) => {
            if (!valid) {
              valid = false
              debug.log(errs)
            }
            GJV.isPoint(marker.geometry, (valid, errs) => {
              if (!valid) {
                valid = false
                debug.log(errs)
              } else {
                if (!marker.properties.mhid) {
                  // mhid not found determine an ID for the marker
                  if (marker.properties.osm_id) {
                    marker.properties.mhid = layer_id + ':' + marker.properties.osm_id
                  } else if (marker.properties['id']) {
                    marker.properties.mhid = layer_id + ':' + marker.properties['id']
                  } else if (marker.properties['ID']) {
                    marker.properties.mhid = layer_id + ':' + marker.properties['ID']
                  } else if (marker.properties['OBJECTID']) {
                    marker.properties.mhid = layer_id + ':' + marker.properties['OBJECTID']
                  } else {
                    marker.properties.mhid = layer_id + ':' + i
                  }
                }

                if (markerConfig.remote_host) {
                  marker.properties.maphubs_host = markerConfig.remote_host
                } else {
                  marker.properties.maphubs_host = window.location.hostname
                }

                if (!marker.properties['maphubs_metadata']) {
                  marker.properties['maphubs_metadata'] = {}
                }
                marker.properties['maphubs_metadata'].presets = presets

                const markerId = marker.properties.mhid

                // create a DOM element for the marker
                const el = document.createElement('div')
                el.className = 'maphubs-marker-' + layer_id
                el.style.width = markerConfig.width + 'px'
                el.style.height = markerConfig.height + 'px'

                el.addEventListener('click', (e) => {
                  e.stopPropagation()
                  marker.properties.layer_id = layer_id
                  //
                  if (mapComponent.state.editing) {
                    if (mapComponent.state.editingLayer.layer_id === marker.properties.layer_id) {
                      mapComponent.editFeature(marker)
                    }
                    return // return here to disable interactation with other layers when editing
                  }
                  mapComponent.setSelectionFilter([marker])
                  mapComponent.setState({selectedFeature: marker, selected: true})
                })

                ReactDOM.render(
                  <Marker {...markerConfig} />,
                  el
                )

                let offsetHeight
                if (markerConfig.shape === 'MAP_PIN' || markerConfig.shape === 'SQUARE_PIN') {
                  offsetHeight = -(markerConfig.height / 2)
                } else {
                  offsetHeight = 0
                }

                const mapboxMarker = new mapboxgl.Marker(el, {offset: [0, offsetHeight]})
                  .setLngLat(marker.geometry.coordinates)
                  .addTo(map)

                if (MarkerActions.addMarker) {
                  MarkerActions.addMarker(layer_id, markerId, mapboxMarker)
                }
              }
            })
          })
        })
        // add marker shadows (hidden for now)
        // Need to draw something so layer is avaliable for search (otherwise source tiles are not cached)
        const markerLayer = {
          'id': layer.id,
          'type': 'circle',
          'metadata': {
            'maphubs:layer_id': layer_id,
            'maphubs:globalid': shortid,
            'maphubs:interactive': false,
            'maphubs:showBehindBaseMapLabels': true
          },
          'source': layer.source,
          'source-layer': 'data',
          'filter': ['in', '$type', 'Point'],
          'paint': {
            'circle-color': '#212121',
            'circle-opacity': 0 // hidden
          }
        }

        if (layer['source-layer']) {
          markerLayer['source-layer'] = layer['source-layer']
        }
        debug.info(`adding marker shadow layer for ${layer_id}`)
        mapComponent.addLayerBefore(markerLayer, 'water')
        mapComponent.map.setStyle(mapComponent.glStyle)
      }

      let geobufUrl = markerConfig.geobufUrl
      if (geobufUrl) {
        geobufUrl = geobufUrl.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl())
        superagent.get(geobufUrl)
          .buffer(true)
          .responseType('arraybuffer')
          .parse(superagent.parse.image)
          .end((err, res) => {
            if (err) {
              debug.error(err)
            } else {
              const geoJSON = geobuf.decode(new Pbf(new Uint8Array(res.body)))
              createMarkersFromGeoJSON(geoJSON)
            }
          })
      } else {
        superagent.get(geojsonUrl)
          .type('json').accept('json')
          .end((err, res) => {
            checkClientError(res, err, (err) => {
              if (err) {
                debug.error(err)
              } else {
                const geojson = res.body
                createMarkersFromGeoJSON(geojson)
              }
            },
            (cb) => {
              cb()
            }
            )
          })
      }
    } else if (layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']) {
      mapComponent.addLayerBefore(layer, 'water')
    } else {
      if (mapComponent.state.editing) {
        mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
      } else {
        mapComponent.addLayer(layer, position)
      }
    }
  },
  removeLayer (layer: GLLayer, mapComponent: any) {
    if (layer.metadata && layer.metadata['maphubs:markers']) {
      const layer_id = layer.metadata['maphubs:layer_id']
      $('.maphubs-marker-' + layer_id).each((i, markerDiv) => {
        ReactDOM.unmountComponentAtNode(markerDiv)
        $(markerDiv).remove()
      })
      if (MarkerActions.removeLayer) {
        MarkerActions.removeLayer(layer_id)
      }
    }
    mapComponent.removeLayer(layer.id)
  },
  remove (key: string, mapComponent: any) {
    mapComponent.removeSource(key)
  }
}

export default MapHubsSource
