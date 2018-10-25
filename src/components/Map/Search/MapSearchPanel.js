// @flow
import React from 'react'
import request from 'superagent'
import {Tooltip} from 'react-tippy'
import { Tabs, notification, Input, Button } from 'antd'
import Drawer from 'rc-drawer'
import 'rc-drawer/assets/index.css'
import DebugService from '../../../services/debug'
const debug = DebugService('MapSearchPanel')
const TabPane = Tabs.TabPane
const Search = Input.Search

type Props = {
  show: boolean,
  onSearch: Function,
  onSearchResultClick: Function,
  onSearchReset: Function,
  t: Function
}

type State = {
  results?: ?Object,
  locationSearchResults?: ?Object,
  tab: string,
  query?: string,
  open?: boolean
}

export default class MapSearchPanel extends React.Component<Props, State> {
  props: Props

  static defaultProps = {
    show: false
  }

  state: State

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

  onSearch = (query: string) => {
    if (this.state.tab === 'data') {
      const results = this.props.onSearch(query)
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
    this.setState({results: null, locationSearchResults: null, query: undefined})
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
    const url = `https://geocoder.tilehosting.com/q/${query}.js?key=${MAPHUBS_CONFIG.TILEHOSTING_GEOCODING_API_KEY}`

    request.get(url)
      .then((res) => {
        const { count, results } = res.body
        if (count > 0 && results) {
          const features = results.map((feature) => {
            /* eslint-disable camelcase */
            const { id, name, display_name } = feature
            return {
              key: `${id}`,
              value: display_name || name,
              feature
            }
          })
          return _this.setState({locationSearchResults: features, query})
        } // elsefeatures
      })
      .catch(err => {
        debug.log(err)
        notification['error']({
          message: 'Error',
          description: err.toString(),
          duration: 0
        })
      })
  }

  render () {
    const _this = this
    const {t} = this.props
    let results = ''

    if (this.state.results &&
      this.state.results.list &&
      this.state.results.list.length > 0) {
      results = (
        <div className='collection'>
          {
            this.state.results.list.map(result => {
              return (
                <a key={result.id} href='#!' className='collection-item'
                  onClick={() => { _this.onClickResult(result.geoJSON) }}>
                  {result.name}
                </a>
              )
            })
          }
        </div>
      )
    } else {
      results = (
        <p>{t('Use the box above to search')}</p>
      )
    }

    let searchLabel = ''
    if (this.state.tab === 'data') {
      searchLabel = t('Search Data')
    } else if (this.state.tab === 'location') {
      searchLabel = t('Find Place or Address')
    }

    let locationResults = ''
    if (this.state.locationSearchResults &&
      this.state.locationSearchResults.length > 0) {
      locationResults = (
        <div className='collection'>
          {
            this.state.locationSearchResults.map(result => {
              return (
                <a key={result.key} href='#!' className='collection-item'
                  onClick={() => { _this.onClickResult(result.feature) }}>
                  {result.value}
                </a>
              )
            })
          }
        </div>
      )
    }

    return (
      <div>
        <Tooltip
          title={t('Search')}
          position='bottom' inertia followCursor
        >
          <a
            href='#'
            onMouseDown={() => { this.onSetOpen(true) }}
            style={{
              display: this.props.show ? 'inherit' : 'none',
              position: 'absolute',
              top: '10px',
              right: '50px',
              height: '30px',
              zIndex: '100',
              borderRadius: '4px',
              lineHeight: '30px',
              textAlign: 'center',
              boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
              width: '30px'
            }}
          >
            <i className='material-icons'
              style={{height: '30px',
                lineHeight: '30px',
                width: '30px',
                color: '#000',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'white',
                borderColor: '#ddd',
                borderStyle: 'none',
                borderWidth: '1px',
                textAlign: 'center',
                fontSize: '18px'}}
            >search</i>
          </a>
        </Tooltip>
        <div ref={(el) => { this.drawerContainer = el }} />
        <Drawer
          getContainer={() => this.drawerContainer}
          open={this.state.open}
          onMaskClick={() => { this.onSetOpen(false) }}
          handler={false}
          level={null}
          placement='right'
          width='240px'
        >
          <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={() => { this.onSetOpen(false) }}>
            <i className='material-icons selected-feature-close' style={{fontSize: '20px'}}>close</i>
          </a>
          <div style={{padding: '20px 5px 0px 5px', height: '100%', border: 'solid 1px #ddd'}}>
            <div style={{position: 'relative'}}>
              <Search
                placeholder={searchLabel}
                onChange={this.onSearch}
                onSearch={this.onSubmit}
                style={{}}
              />
              {this.state.query &&
                <Button
                  shape='circle' icon='close'
                  onClick={this.onReset}
                  style={{position: 'absolute', top: '8px', right: '0px'}}
                />
              }
            </div>
            <Tabs defaultActiveKey='data' onChange={this.selectTab}>
              <TabPane tab={t('Data')} key='data'>
                {results}
              </TabPane>
              <TabPane tab={t('Location')} key='location'>
                {locationResults}
              </TabPane>
            </Tabs>
          </div>
        </Drawer>
      </div>
    )
  }
}
