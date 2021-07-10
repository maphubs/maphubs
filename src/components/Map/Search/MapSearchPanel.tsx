import React from 'react'
import request from 'superagent'
import { Tabs, notification, Input, Row, Drawer, List } from 'antd'
import MapToolButton from '../MapToolButton'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { LocalizedString } from '../../../types/LocalizedString'
const debug = DebugService('MapSearchPanel')
const TabPane = Tabs.TabPane
const Search = Input.Search
type Props = {
  show: boolean
  onSearch: (...args: Array<any>) => any
  onSearchResultClick: (...args: Array<any>) => any
  onSearchReset: (...args: Array<any>) => any
  t: (v: string | LocalizedString) => string
  mapboxAccessToken: string
}
type State = {
  results?: Record<string, any> | null | undefined
  locationSearchResults?: Record<string, any> | null | undefined
  tab: string
  query?: string
  open?: boolean
}
export default class MapSearchPanel extends React.Component<Props, State> {
  static defaultProps: {
    show: boolean
  } = {
    show: false
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      tab: 'data'
    }
  }

  drawerContainer: any
  onSetOpen: (open: boolean) => void = (open: boolean) => {
    this.setState({
      open
    })
  }
  onSearch: (e: any) => Promise<void> = async (e: any) => {
    const query = e.target.value

    if (!query) {
      this.onReset()
      return
    }

    if (this.state.tab === 'data') {
      const results = await this.props.onSearch(query)
      this.setState({
        results,
        query
      })
    } else if (this.state.tab === 'location') {
      this.runLocationSearch(query)
    }
  }
  onSubmit: () => void = () => {
    // enter is pressed in search box
    // do nothing, since we update automatically
  }
  onReset: () => void = () => {
    this.setState({
      results: undefined,
      locationSearchResults: undefined,
      query: undefined
    })
    this.props.onSearchReset()
  }
  onClickResult: (result: any) => void = (result: Record<string, any>) => {
    this.props.onSearchResultClick(result)
  }
  selectTab: (tab: string) => void = (tab: string) => {
    if (tab === 'location' && this.state.tab !== 'location') {
      this.setState({
        tab
      })

      if (this.state.query && !this.state.locationSearchResults) {
        this.runLocationSearch(this.state.query)
      }
    } else if (
      tab === 'data' &&
      this.state.tab !== 'data' &&
      this.state.query
    ) {
      this.setState({
        tab
      })

      if (!this.state.results) {
        const results = this.props.onSearch(this.state.query)
        this.setState({
          results
        })
      }
    }
  }

  runLocationSearch(query: string): void {
    const { setState } = this
    // run autocomplete search
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${this.props.mapboxAccessToken}&autocomplete=true`
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
          return setState({
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

  render(): JSX.Element {
    const {
      props,
      state,
      drawerContainer,
      onSearch,
      onSubmit,
      selectTab,
      onClickResult
    } = this
    const { t, show } = props
    const { tab, results, locationSearchResults, open } = state
    let searchLabel = ''

    if (tab === 'data') {
      searchLabel = t('Search Data')
    } else if (tab === 'location') {
      searchLabel = t('Find Place or Address')
    }

    return (
      <div>
        <MapToolButton
          onMouseDown={() => {
            this.onSetOpen(true)
          }}
          tooltipText={t('Search')}
          top='10px'
          right='50px'
          show={show}
          icon='search'
        />
        <div
          ref={(el) => {
            this.drawerContainer = el
          }}
        />
        <Drawer
          getContainer={() => drawerContainer}
          title={t('Search')}
          visible={open}
          onClose={() => {
            this.onSetOpen(false)
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
              onChange={onSearch}
              onSearch={onSubmit}
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
                            key={item.key}
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
}
