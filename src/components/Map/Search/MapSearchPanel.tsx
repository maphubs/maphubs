import React, { useState, useRef } from 'react'
import request from 'superagent'
import { Tabs, notification, Input, Row, Drawer, List } from 'antd'
import MapToolButton from '../MapToolButton'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import useT from '../../../hooks/useT'

const debug = DebugService('MapSearchPanel')
const TabPane = Tabs.TabPane
const Search = Input.Search
type Props = {
  show?: boolean
  onSearch: (...args: Array<any>) => any
  onSearchResultClick: (...args: Array<any>) => any
  onSearchReset: (...args: Array<any>) => any
  mapboxAccessToken: string
}
type State = {
  results?: { list: Record<string, unknown>[] }
  locationSearchResults?: Record<string, unknown>[]
  query?: string
}
const MapSearchPanel = ({
  show,
  mapboxAccessToken,
  onSearch,
  onSearchReset,
  onSearchResultClick
}: Props): JSX.Element => {
  const drawerContainer = useRef()
  const { t } = useT()
  const [tab, setTab] = useState('data')
  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<State>()

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
