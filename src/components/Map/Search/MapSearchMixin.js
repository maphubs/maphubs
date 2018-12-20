// @flow
import _includes from 'lodash.includes'
import _find from 'lodash.find'
import _buffer from '@turf/buffer'
import _bbox from '@turf/bbox'
import type {GLSource, GLLayer} from '../../../types/mapbox-gl-style'

import DebugService from '../../../services/debug'
const debug = DebugService('MapSearchMixin')

const uuid = require('uuid').v1

export default {

  getActiveLayerIds () {
    const layerIds = []
    const sourceIds = []
    if (this.overlayMapStyle) {
      this.overlayMapStyle.layers.forEach((layer) => {
        if (layer.metadata &&
          (layer.metadata['maphubs:interactive'] ||
            (layer.metadata['maphubs:markers'] &&
                layer.metadata['maphubs:markers'].enabled
            )
          ) &&
          (layer.id.startsWith('omh') || layer.id.startsWith('osm'))
        ) {
          const sourceId = layer.source
          if (!_includes(sourceIds, sourceId)) {
            sourceIds.push(sourceId)
          }
          layerIds.push(layer.id)
        }
      })
    }
    debug.log(`active layers: ${layerIds.length} active sources: ${sourceIds.length}`)
    return {
      layerIds,
      sourceIds
    }
  },

  getFirstLabelLayer () {
    const glStyle = this.glStyle
    let firstLayer
    if (glStyle && glStyle.layers && glStyle.layers.length > 0) {
      glStyle.layers.forEach(layer => {
        if (!firstLayer && layer.id.startsWith('omh-label')) {
          firstLayer = layer.id
        }
      })
    } else if (this.state.baseMap === 'default' ||
       this.state.baseMap === 'dark' ||
       this.state.baseMap === 'streets') {
      firstLayer = 'place_other'
    }
    return firstLayer
  },

  async initIndex () {
    const {layerIds, sourceIds} = this.getActiveLayerIds()
    this.searchSourceIds = sourceIds
    const features = this.map.queryRenderedFeatures({layers: layerIds})
    this.searchFeatures = {}
    const searchFeatures = this.searchFeatures
    debug.log(`initializing index for ${features && features.length} features`)
    debug.log(features)
    return new Promise((resolve) => {
      this.idx = this.lunr(function () {
        this.ref('id')
        this.field('properties')
        if (features) {
          features.forEach(feature => {
            const id = feature.properties.mhid
            const properties = Object.values(feature.properties).join(' ')
            this.add({ id, properties })
            searchFeatures[id] = feature
          })
        }
        debug.log('***search index initialized***')
        resolve()
      })
    })
  },

  getNameFieldForResult (result: Object) {
    const {t} = this.props

    const source = this.overlayMapStyle.sources[result.source]
    const presets = source.metadata['maphubs:presets']
    const nameFieldPreset = _find(presets, {isName: true})
    let nameField = nameFieldPreset ? nameFieldPreset.tag : undefined

    if (!nameField) {
      const matchNameArr = []
      if (presets && presets.length > 0) {
        presets.forEach(preset => {
          if (preset && preset.label) {
            const label = t(preset.label).toString()
            if (label.match(/.*[N,n]ame.*/g)) {
              matchNameArr.push(preset.tag)
            }
          }
        })
        if (matchNameArr.length > 0) {
          // found something that matches Name
          nameField = matchNameArr[0]
        } else {
          // otherwise just take the first preset
          nameField = presets[0].tag
        }
      } else if (result) {
        // use props of first feature
        const propNames = Object.keys(result.properties)
        propNames.forEach(propName => {
          if (propName.match(/.*[N,n]ame.*/g)) {
            matchNameArr.push(propName)
          }
        })
        if (matchNameArr.length > 0) {
          // found something that matches Name
          nameField = matchNameArr[0]
        } else {
          // otherwise just take the first prop
          nameField = propNames[0]
        }
      }
    }
    return nameField
  },

  async onSearch (queryText: string) {
    const _this = this
    // clear prev display layers
    this.onSearchReset()

    const results = {
      list: []
    }

    let searchDisplayLayers = []

    if (!this.idx) await this.initIndex()
    const searchResults = this.idx.search(queryText)
    const queryResults = searchResults.map(r => this.searchFeatures[r.ref])
    debug.log(queryResults)

    const mhids = []
    queryResults.forEach(result => {
      const nameField = this.getNameFieldForResult(result)
      const name = result.properties[nameField]
      const data = {
        id: result.properties.mhid,
        name
      }
      if (result.properties.mhid) {
        // dedupe by mhid since mapbox-gl can return duplicates
        if (!_includes(mhids, result.properties.mhid)) {
          results.list.push(data)
          mhids.push(result.properties.mhid)
        }
      } else {
        // otherwise just add everything
        data.id = uuid()
        results.list.push(data)
      }
    })

    // set display layers for each source
    if (this.searchSourceIds) {
      this.searchSourceIds.map(sourceId => {
        if (queryResults && queryResults.length > 0) {
          const source = _this.overlayMapStyle.sources[sourceId]
          searchDisplayLayers = searchDisplayLayers.concat(_this.getSearchDisplayLayers(sourceId, source, mhids))
        }
      })
    }

    // calculate bounds of results
    if (results.list.length > 0) {
      // getting a weird effect from larger polygon layers if they are zoomed inside of their boundaries
      if (_this.map.getZoom() < 10) {
        const bbox = _bbox({type: 'FeatureCollection', features: queryResults})
        _this.map.fitBounds(bbox, {padding: 25, curve: 3, speed: 0.6, maxZoom: 16})
        results.bbox = bbox
      }
    }

    this.searchDisplayLayers = searchDisplayLayers
    const firstLabelLayer = _this.getFirstLabelLayer()
    searchDisplayLayers.forEach(layer => {
      _this.map.addLayer(layer, firstLabelLayer)
    })

    debug.log(results)
    return results
  },

  onSearchResultClick (result: Object) {
    const _this = this

    if ((!result.geometry || !result._geometry) && this.searchSourceIds) {
      const feature = this.searchFeatures[result.id]
      if (feature) {
        result = feature
      } else {
        // try to retrieve geometry from mapboxgl
        this.searchSourceIds.map(sourceId => {
          // query sources in case map has moved from original search area
          const results = _this.map.querySourceFeatures(sourceId, {filter: ['in', 'mhid', result.id]})
          if (results && results.length > 0) {
            result = results[0]
          }
        })
      }
    }

    if (result.bbox || result.boundingbox) {
      const bbox = result.bbox ? result.bbox : result.boundingbox
      this.map.fitBounds(bbox, {padding: 25, curve: 3, speed: 0.6, maxZoom: 16})
    } else if (result._geometry || result.geometry) {
      let geometry = result._geometry ? result._geometry : result.geometry
      if (geometry.type === 'Point') {
        const bufferedPoint = _buffer(result, 500, {units: 'meters'})
        geometry = bufferedPoint.geometry
      }
      const bbox = _bbox(geometry)
      this.map.fitBounds(bbox, {padding: 25, curve: 3, speed: 0.6, maxZoom: 22})
    } else if (result.lat && result.lon) {
      this.map.flyTo({center: [result.lon, result.lat]})
    }
  },

  onSearchReset () {
    const _this = this
    if (this.searchDisplayLayers && this.searchDisplayLayers.length > 0) {
      this.searchDisplayLayers.forEach(layer => {
        _this.map.removeLayer(layer.id)
      })
    }
  },

  getSearchDisplayLayers (sourceID: string, source: GLSource, mhids: Array<string>): Array<GLLayer> {
    const searchLayerColor = 'yellow'
    const mhidFilter = ['in', 'mhid'].concat(mhids)
    return [
      {
        'id': `omh-search-result-point-${sourceID}`,
        'type': 'circle',
        'source': sourceID,
        'source-layer': source.type === 'geojson' ? '' : 'data',
        'filter': [ 'all',
          ['in', '$type', 'Point'],
          mhidFilter
        ],
        'paint': {
          'circle-radius': 15,
          'circle-color': searchLayerColor,
          'circle-opacity': 0.5
        }
      },
      {
        'id': `omh-search-result-line-${sourceID}`,
        'type': 'line',
        'source': sourceID,
        'source-layer': source.type === 'geojson' ? '' : 'data',
        'filter': [ 'all',
          ['in', '$type', 'LineString'],
          mhidFilter
        ],
        'paint': {
          'line-color': searchLayerColor,
          'line-opacity': 0.3,
          'line-width': 1
        }
      },
      {
        'id': `omh-search-result-polygon-${sourceID}`,
        'type': 'fill',
        'source': sourceID,
        'source-layer': source.type === 'geojson' ? '' : 'data',
        'filter': [ 'all',
          ['in', '$type', 'Polygon'],
          mhidFilter
        ],
        'paint': {
          'fill-color': searchLayerColor,
          'fill-outline-color': 'black',
          'fill-opacity': 0.7
        }
      }
    ]
  }

}
