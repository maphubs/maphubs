import React, { useState, useRef } from 'react'
import request from 'superagent'
import { Tabs, notification, Input, Row, Drawer, List } from 'antd'
import MapToolButton from '../MapToolButton'
import DebugService from '../../lib/debug'
import useMapT from '../../hooks/useMapT'
import _includes from 'lodash.includes'
import _find from 'lodash.find'
import _buffer from '@turf/buffer'
import _bbox from '@turf/bbox'
import { v1 as uuidv1 } from 'uuid'
import mapboxgl from 'mapbox-gl'
import lunr from 'lunr'
import { useSelector } from '../../redux/hooks'
import { selectMapboxMap } from '../../redux/reducers/mapSlice'
import { Feature } from 'geojson'

const debug = DebugService('MapSearchPanel')
const TabPane = Tabs.TabPane
const Search = Input.Search
type Props = {
  show?: boolean
  mapboxAccessToken: string
}
type SearchState = {
  results?: { list: Record<string, unknown>[] }
  locationSearchResults?: Record<string, unknown>[]
  query?: string
}

type SearchFeatures = Record<string, Feature>

type LayerWithMeta = mapboxgl.Layer & { metadata: Record<string, unknown> }

const getSearchDisplayLayers = (
  sourceID: string,
  source: mapboxgl.Source,
  mhids: Array<string>
): mapboxgl.Layer[] => {
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

const MapSearchPanel = ({ show, mapboxAccessToken }: Props): JSX.Element => {
  const drawerContainer = useRef()
  const idx = useRef()
  const searchFeaturesRef = useRef<SearchFeatures>()
  const { t } = useMapT()
  const [tab, setTab] = useState('data')
  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchState>({})
  const [searchSourceIds, setSearchSourceIds] = useState<string[]>()
  const [searchDisplayLayers, setSearchDisplayLayers] =
    useState<mapboxgl.AnyLayer[]>()

  const mapboxMap = useSelector(selectMapboxMap)
  const overlayMapStyle = useSelector((state) => state.map.overlayMapStyle)
  const glStyle = useSelector((state) => state.map.glStyle)
  const baseMap = useSelector((state) => state.baseMap.baseMap)

  const search = async (e: any) => {
    const query = e.target.value

    if (!query) {
      onReset()
      return
    }

    if (tab === 'data') {
      const results = await onSearch(query)
      setSearchResults({
        results,
        query
      })
    } else if (tab === 'location') {
      runLocationSearch(query)
    }
  }

  const onReset = () => {
    setSearchResults({
      results: undefined,
      locationSearchResults: undefined,
      query: undefined
    })
    onSearchReset()
  }
  const onClickResult = (result: Record<string, any>) => {
    onSearchResultClick(result)
  }
  const selectTab = (selectedTab: string) => {
    if (selectedTab === 'location' && tab !== 'location') {
      setTab(selectedTab)

      if (searchResults.query && !searchResults.locationSearchResults) {
        runLocationSearch(searchResults.query)
      }
    } else if (
      selectedTab === 'data' &&
      tab !== 'data' &&
      searchResults.query
    ) {
      setTab(selectedTab)

      if (!searchResults.results) {
        const results = onSearch(searchResults.query)
        setSearchResults({
          results,
          query: searchResults.query
        })
      }
    }
  }

  const getActiveLayerIds = (): {
    layerIds: Array<string>
    sourceIds: Array<string>
  } => {
    const layerIds = []
    const sourceIds = []

    if (overlayMapStyle) {
      for (const layer of overlayMapStyle.layers as LayerWithMeta[]) {
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
  }

  const getFirstLabelLayer = (): void | string => {
    let firstLayer

    if (glStyle && glStyle.layers && glStyle.layers.length > 0) {
      for (const layer of glStyle.layers) {
        if (!firstLayer && layer.id.startsWith('omh-label')) {
          firstLayer = layer.id
        }
      }
    } else if (
      baseMap === 'default' ||
      baseMap === 'dark' ||
      baseMap === 'streets'
    ) {
      firstLayer = 'place_other'
    }

    return firstLayer
  }

  const initIndex = async (): Promise<void> => {
    const { layerIds, sourceIds } = getActiveLayerIds()
    setSearchSourceIds(sourceIds)
    const features = mapboxMap.queryRenderedFeatures(null, {
      layers: layerIds
    })
    const searchFeatures = {}
    debug.log(`initializing index for ${features?.length} features`)
    debug.log(features)
    await new Promise((resolve) => {
      idx.current = lunr(function () {
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
        resolve(true)
      })
    })
    searchFeaturesRef.current = searchFeatures
  }

  const getNameFieldForResult = (result: Record<string, any>): any | string => {
    const source = overlayMapStyle.sources[result.source] as mapboxgl.Source & {
      metadata: any
    }
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
  }

  const onSearch = async (
    queryText: string
  ): Promise<{
    list: Array<
      | any
      | {
          id: any
          name: any
        }
    >
  }> => {
    // clear prev display layers
    onSearchReset()
    const results = {
      list: []
    }
    let displayLayers = []
    if (!idx.current) await initIndex()
    const searchResults = idx.current.search(queryText)
    const queryResults = searchResults.map(
      (r) => searchFeaturesRef.current[r.ref]
    )
    debug.log(queryResults)
    const mhids = []
    for (const result of queryResults) {
      const nameField = getNameFieldForResult(result)
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
          displayLayers = [
            ...displayLayers,
            ...getSearchDisplayLayers(sourceId, source, mhids)
          ]
        }
      })
    }

    // calculate bounds of results
    if (
      results.list.length > 0 && // getting a weird effect from larger polygon layers if they are zoomed inside of their boundaries
      mapboxMap.getZoom() < 10
    ) {
      const bbox = _bbox({
        type: 'FeatureCollection',
        features: queryResults
      })

      mapboxMap.fitBounds(bbox, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 16
      })

      results.bbox = bbox
    }

    setSearchDisplayLayers(displayLayers)

    const firstLabelLayer = getFirstLabelLayer()

    for (const layer of displayLayers) {
      mapboxMap.addLayer(layer, firstLabelLayer || undefined)
    }
    debug.log(results)
    return results
  }

  const onSearchResultClick = (result: any) => {
    if ((!result.geometry || !result._geometry) && searchSourceIds) {
      const feature = searchFeaturesRef.current[result.id]

      if (feature) {
        result = feature
      } else {
        // try to retrieve geometry from mapboxgl
        searchSourceIds.map((sourceId) => {
          // query sources in case map has moved from original search area
          const results = mapboxMap.querySourceFeatures(sourceId, {
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
      mapboxMap.fitBounds(bbox, {
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

      mapboxMap.fitBounds(bbox, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 22
      })
    } else if (result.lat && result.lon) {
      mapboxMap.flyTo({
        center: [result.lon, result.lat]
      })
    }
  }

  const onSearchReset = () => {
    if (searchDisplayLayers && searchDisplayLayers.length > 0) {
      for (const layer of searchDisplayLayers) {
        mapboxMap.removeLayer(layer.id)
      }
    }
  }

  const runLocationSearch = (query: string): void => {
    // run autocomplete search
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxAccessToken}&autocomplete=true`
    request
      .get(url)
      .then((res) => {
        const { features } = res.body

        if (features && features.length > 0) {
          const featuresCleaned = features.map((feature) => {
            /* eslint-disable camelcase */
            if (feature) {
              return {
                key: `${feature.id}`,
                value:
                  feature.matching_place_name ||
                  feature.place_name ||
                  feature.text,
                feature
              }
            }
          })
          return setSearchResults({
            locationSearchResults: featuresCleaned,
            query
          })
        } // elsefeatures
      })
      .catch((err) => {
        debug.log(err)
        notification.error({
          message: 'Error',
          description: err.toString(),
          duration: 0
        })
      })
  }

  let searchLabel = ''

  if (tab === 'data') {
    searchLabel = t('Search Data')
  } else if (tab === 'location') {
    searchLabel = t('Find Place or Address')
  }

  const { results, query, locationSearchResults } = searchResults

  return (
    <div>
      <MapToolButton
        onMouseDown={() => {
          setOpen(true)
        }}
        tooltipText={t('Search')}
        top='10px'
        right='50px'
        show={show}
        icon='search'
      />
      <div ref={drawerContainer} />
      <Drawer
        getContainer={() => drawerContainer.current}
        title={t('Search')}
        visible={open}
        onClose={() => {
          setOpen(false)
        }}
        bodyStyle={{
          padding: '2px'
        }}
        placement='right'
        width='240px'
      >
        <Row>
          <Search
            placeholder={searchLabel}
            onChange={search}
            onSearch={() => {
              //do nothing, results update automatically
            }}
            style={{}}
            allowClear
          />
        </Row>
        <Row>
          <Tabs animated={false} defaultActiveKey='data' onChange={selectTab}>
            <TabPane tab={t('Data')} key='data'>
              {results && results.list.length > 0 && (
                <List
                  size='small'
                  bordered
                  dataSource={results.list}
                  renderItem={(item: { id: string; name: string }) => {
                    return (
                      <List.Item>
                        <a
                          key={item.id}
                          href='#!'
                          onClick={() => {
                            onClickResult(item)
                          }}
                        >
                          {item.name}
                        </a>
                      </List.Item>
                    )
                  }}
                />
              )}
            </TabPane>
            <TabPane tab={t('Location')} key='location'>
              {locationSearchResults && locationSearchResults.length > 0 && (
                <List
                  size='small'
                  bordered
                  dataSource={locationSearchResults}
                  renderItem={(item) => {
                    return (
                      <List.Item>
                        <a
                          href='#!'
                          className='collection-item'
                          onClick={() => {
                            onClickResult(item.feature)
                          }}
                        >
                          {item.value}
                        </a>
                      </List.Item>
                    )
                  }}
                />
              )}
            </TabPane>
          </Tabs>
        </Row>
      </Drawer>
    </div>
  )
}
export default MapSearchPanel
