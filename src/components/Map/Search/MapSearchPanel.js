// @flow
import React from 'react'
import request from 'superagent'
import { Tabs, notification, Input, Row, Drawer, List } from 'antd'
import MapToolButton from '../MapToolButton'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('MapSearchPanel')
const TabPane = Tabs.TabPane
const Search = Input.Search

type Props = {
  show: boolean,
  onSearch: Function,
  onSearchResultClick: Function,
  onSearchReset: Function,
  t: Function,
  mapboxAccessToken: string
}

type State = {
  results?: ?Object,
  locationSearchResults?: ?Object,
  tab: string,
  query?: string,
  open?: boolean
}

export default class MapSearchPanel extends React.Component<Props, State> {
  static defaultProps = {
    show: false
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      tab: 'data'
    }
  }

  drawerContainer: any

  onSetOpen = (open: boolean) => {
    this.setState({ open })
  }

  onSearch = async (e: any) => {
    const query = e.target.value
    if (!query) {
      this.onReset()
      return
    }
    if (this.state.tab === 'data') {
      const results = await this.props.onSearch(query)
      this.setState({results, query})
    } else if (this.state.tab === 'location') {
      this.runLocationSearch(query)
    }
  }

  onSubmit = () => {
    // enter is pressed in search box
    // do nothing, since we update automatically
  }

  onReset = () => {
    this.setState({results: undefined, locationSearchResults: undefined, query: undefined})
    this.props.onSearchReset()
  }

  onClickResult = (result: Object) => {
    this.props.onSearchResultClick(result)
  }

  selectTab = (tab: string) => {
    if (tab === 'location' && this.state.tab !== 'location') {
      this.setState({tab})
      if (this.state.query && !this.state.locationSearchResults) {
        this.runLocationSearch(this.state.query)
      }
    } else if (tab === 'data' &&
      this.state.tab !== 'data' &&
      this.state.query) {
      this.setState({tab})
      if (!this.state.results) {
        const results = this.props.onSearch(this.state.query)
        this.setState({results})
      }
    }
  }

  runLocationSearch (query: string) {
    const _this = this
    // run autocomplete search
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${this.props.mapboxAccessToken}&autocomplete=true`

    request.get(url)
      .then((res) => {
        const { features } = res.body
        if (features && features.length > 0) {
          const featuresCleaned = features.map((feature) => {
            /* eslint-disable camelcase */
            if (feature) {
              return {
                key: `${feature.id}`,
                value: feature.matching_place_name || feature.place_name || feature.text,
                feature
              }
            }
          })
          return _this.setState({locationSearchResults: featuresCleaned, query})
        } // elsefeatures
      })
      .catch(err => {
        debug.log(err)
        notification.error({
          message: 'Error',
          description: err.toString(),
          duration: 0
        })
      })
  }

  render () {
    const _this = this
    const {t} = this.props
    const { tab, results, locationSearchResults } = this.state

    let searchLabel = ''
    if (tab === 'data') {
      searchLabel = t('Search Data')
    } else if (tab === 'location') {
      searchLabel = t('Find Place or Address')
    }

    return (
      <div>
        <MapToolButton
          onMouseDown={() => { this.onSetOpen(true) }}
          tooltipText={t('Search')}
          top='10px'
          right='50px'
          show={this.props.show}
          icon='search'
        />
        <div ref={(el) => { this.drawerContainer = el }} />
        <Drawer
          getContainer={() => this.drawerContainer}
          title={t('Search')}
          visible={this.state.open}
          onClose={() => { this.onSetOpen(false) }}
          bodyStyle={{padding: '2px'}}
          placement='right'
          width='240px'
        >
          <Row>
            <Search
              placeholder={searchLabel}
              onChange={this.onSearch}
              onSearch={this.onSubmit}
              style={{}}
              allowClear
            />
          </Row>
          <Row>
            <Tabs
              animated={false}
              defaultActiveKey='data'
              onChange={this.selectTab}
            >
              <TabPane tab={t('Data')} key='data'>
                {(results && results.list.length > 0) &&
                  <List
                    size='small'
                    bordered
                    dataSource={results.list}
                    renderItem={item => {
                      return (
                        <List.Item>
                          <a
                            key={item.id} href='#!'
                            onClick={() => { _this.onClickResult(item) }}
                          >
                            {item.name}
                          </a>
                        </List.Item>
                      )
                    }}
                  />}
              </TabPane>
              <TabPane tab={t('Location')} key='location'>
                {(locationSearchResults && locationSearchResults.length > 0) &&
                  <List
                    size='small'
                    bordered
                    dataSource={locationSearchResults}
                    renderItem={item => {
                      return (
                        <List.Item>
                          <a
                            key={item.key} href='#!' className='collection-item'
                            onClick={() => { _this.onClickResult(item.feature) }}
                          >
                            {item.value}
                          </a>
                        </List.Item>
                      )
                    }}
                  />}
              </TabPane>
            </Tabs>
          </Row>
        </Drawer>
      </div>
    )
  }
}
