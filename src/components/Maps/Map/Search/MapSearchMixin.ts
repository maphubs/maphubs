import _includes from 'lodash.includes'
import _find from 'lodash.find'
import _buffer from '@turf/buffer'
import _bbox from '@turf/bbox'
import { v1 as uuidv1 } from 'uuid'
import DebugService from '../../lib/debug'
import mapboxgl from 'mapbox-gl'
const debug = DebugService('MapSearchMixin')
export default {
  getActiveLayerIds(): {
    layerIds: Array<any>
    sourceIds: Array<any>
  } {
    const layerIds = []
    const sourceIds = []

    if (this.overlayMapStyle) {
      for (const layer of this.overlayMapStyle.layers) {
        if (
          layer.metadata &&
          (layer.metadata['maphubs:interactive'] ||
            (layer.metadata['maphubs:markers'] &&
              layer.metadata['maphubs:markers'].enabled)) &&
          (layer.id.startsWith('omh') || layer.id.startsWith('osm'))
        ) {
          const sourceId = layer.source

          if (!_includes(sourceIds, sourceId)) {
            sourceIds.push(sourceId)
          }

          layerIds.push(layer.id)
        }
      }
    }

    debug.log(
      `active layers: ${layerIds.length} active sources: ${sourceIds.length}`
    )
    return {
      layerIds,
      sourceIds
    }
  },

  getFirstLabelLayer(): void | string {
    const glStyle = this.glStyle
    let firstLayer

    if (glStyle && glStyle.layers && glStyle.layers.length > 0) {
      for (const layer of glStyle.layers) {
        if (!firstLayer && layer.id.startsWith('omh-label')) {
          firstLayer = layer.id
        }
      }
    } else if (
      this.state.baseMap === 'default' ||
      this.state.baseMap === 'dark' ||
      this.state.baseMap === 'streets'
    ) {
      firstLayer = 'place_other'
    }

    return firstLayer
  },

  async initIndex(): Promise<void> {
    const { layerIds, sourceIds } = this.getActiveLayerIds()
    this.searchSourceIds = sourceIds
    const features = this.map.queryRenderedFeatures({
      layers: layerIds
    })
    this.searchFeatures = {}
    const searchFeatures = this.searchFeatures
    debug.log(`initializing index for ${features?.length} features`)
    debug.log(features)
    return new Promise((resolve) => {
      this.idx = this.lunr(function () {
        this.ref('id')
        this.field('properties')

        if (features) {
          for (const feature of features) {
            const id = feature.properties.mhid
            const properties = Object.values(feature.properties).join(' ')
            this.add({
              id,
              properties
            })
            searchFeatures[id] = feature
          }
        }

        debug.log('***search index initialized***')
        resolve()
      })
    })
  },

  getNameFieldForResult(result: Record<string, any>): any | string {
    const { t } = this.props
    const source = this.overlayMapStyle.sources[result.source]
    const presets = source.metadata['maphubs:presets']

    const nameFieldPreset = _find(presets, {
      isName: true
    })

    let nameField = nameFieldPreset ? nameFieldPreset.tag : undefined

    if (!nameField) {
      const matchNameArr = []

      if (presets && presets.length > 0) {
        for (const preset of presets) {
          if (preset && preset.label) {
            const label = t(preset.label).toString()

            if (/.*[,Nn]ame.*/g.test(label)) {
              matchNameArr.push(preset.tag)
            }
          }
        }

        nameField = matchNameArr.length > 0 ? matchNameArr[0] : presets[0].tag
      } else {
        // use props of first feature
        const propNames = Object.keys(result.properties)
        for (const propName of propNames) {
          if (/.*[,Nn]ame.*/g.test(propName)) {
            matchNameArr.push(propName)
          }
        }

        nameField = matchNameArr.length > 0 ? matchNameArr[0] : propNames[0]
      }
    }

    return nameField
  },

  async onSearch(queryText: string): Promise<{
    list: Array<
      | any
      | {
          id: any
          name: any
        }
    >
  }> {
    const {
      idx,
      map,
      overlayMapStyle,
      searchFeatures,
      searchSourceIds,
      getSearchDisplayLayers,
      getFirstLabelLayer
    } = this

    // clear prev display layers
    this.onSearchReset()
    const results = {
      list: []
    }
    let searchDisplayLayers = []
    if (!idx) await this.initIndex()
    const searchResults = idx.search(queryText)
    const queryResults = searchResults.map((r) => searchFeatures[r.ref])
    debug.log(queryResults)
    const mhids = []
    for (const result of queryResults) {
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
        data.id = uuidv1()
        results.list.push(data)
      }
    }

    // set display layers for each source
    if (searchSourceIds) {
      searchSourceIds.map((sourceId) => {
        if (queryResults && queryResults.length > 0) {
          const source = overlayMapStyle.sources[sourceId]
          searchDisplayLayers = [
            ...searchDisplayLayers,
            ...getSearchDisplayLayers(sourceId, source, mhids)
          ]
        }
      })
    }

    // calculate bounds of results
    if (
      results.list.length > 0 && // getting a weird effect from larger polygon layers if they are zoomed inside of their boundaries
      map.getZoom() < 10
    ) {
      const bbox = _bbox({
        type: 'FeatureCollection',
        features: queryResults
      })

      map.fitBounds(bbox, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 16
      })

      results.bbox = bbox
    }

    this.searchDisplayLayers = searchDisplayLayers

    const firstLabelLayer = getFirstLabelLayer()

    for (const layer of searchDisplayLayers) {
      map.addLayer(layer, firstLabelLayer)
    }
    debug.log(results)
    return results
  },

  onSearchResultClick(result: Record<string, any>): void {
    const { map, searchSourceIds, searchFeatures } = this

    if ((!result.geometry || !result._geometry) && searchSourceIds) {
      const feature = searchFeatures[result.id]

      if (feature) {
        result = feature
      } else {
        // try to retrieve geometry from mapboxgl
        searchSourceIds.map((sourceId) => {
          // query sources in case map has moved from original search area
          const results = map.querySourceFeatures(sourceId, {
            filter: ['in', 'mhid', result.id]
          })

          if (results && results.length > 0) {
            result = results[0]
          }
        })
      }
    }

    if (result.bbox || result.boundingbox) {
      const bbox = result.bbox ? result.bbox : result.boundingbox
      map.fitBounds(bbox, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 16
      })
    } else if (result._geometry || result.geometry) {
      let geometry = result._geometry ? result._geometry : result.geometry

      if (geometry.type === 'Point') {
        const bufferedPoint = _buffer(result, 500, {
          units: 'meters'
        })

        geometry = bufferedPoint.geometry
      }

      const bbox = _bbox(geometry)

      map.fitBounds(bbox, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 22
      })
    } else if (result.lat && result.lon) {
      map.flyTo({
        center: [result.lon, result.lat]
      })
    }
  },

  onSearchReset(): void {
    const { map, searchDisplayLayers } = this

    if (searchDisplayLayers && searchDisplayLayers.length > 0) {
      for (const layer of searchDisplayLayers) {
        map.removeLayer(layer.id)
      }
    }
  },

  getSearchDisplayLayers(
    sourceID: string,
    source: mapboxgl.Source,
    mhids: Array<string>
  ): mapboxgl.Layer[] {
    const searchLayerColor = 'yellow'
    const mhidFilter = ['in', 'mhid', ...mhids]
    return [
      {
        id: `omh-search-result-point-${sourceID}`,
        type: 'circle',
        source: sourceID,
        'source-layer': source.type === 'geojson' ? '' : 'data',
        filter: ['all', ['in', '$type', 'Point'], mhidFilter],
        paint: {
          'circle-radius': 15,
          'circle-color': searchLayerColor,
          'circle-opacity': 0.5
        }
      },
      {
        id: `omh-search-result-line-${sourceID}`,
        type: 'line',
        source: sourceID,
        'source-layer': source.type === 'geojson' ? '' : 'data',
        filter: ['all', ['in', '$type', 'LineString'], mhidFilter],
        paint: {
          'line-color': searchLayerColor,
          'line-opacity': 0.3,
          'line-width': 1
        }
      },
      {
        id: `omh-search-result-polygon-${sourceID}`,
        type: 'fill',
        source: sourceID,
        'source-layer': source.type === 'geojson' ? '' : 'data',
        filter: ['all', ['in', '$type', 'Polygon'], mhidFilter],
        paint: {
          'fill-color': searchLayerColor,
          'fill-outline-color': 'black',
          'fill-opacity': 0.7
        }
      }
    ]
  }
}
