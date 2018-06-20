// @flow
import React from 'react'
import MapHubsComponent from '../../MapHubsComponent'
import SearchBar from '../../SearchBar/SearchBar'
import request from 'superagent'
import MessageActions from '../../../actions/MessageActions'
import {Tooltip} from 'react-tippy'
import DebugService from '../../../services/debug'
const debug = DebugService('MapSearchPanel')

type Props = {
  show: boolean,
  onSearch: Function,
  onSearchResultClick: Function,
  onSearchReset: Function,
  height: string
}

type State = {
  results?: ?Object,
  locationSearchResults?: ?Object,
  tab: string,
  query?: string
}

export default class MapSearchPanel extends MapHubsComponent<Props, State> {
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

  componentDidMount () {
    M.Sidenav.init(this.refs.sidenav, {
      edge: 'right',
      draggable: false
    })
    M.Tabs.init(this.refs.tabs, {})
  }

  onPanelOpen = () => {
    // remove tooltip?
  }

  closePanel = () => {
    M.Sidenav.getInstance(this.refs.sidenav).close()
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
        MessageActions.showMessage({title: 'Error', message: err.toString()})
      })
  }

  render () {
    const _this = this
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
                  onClick={function () { _this.onClickResult(result.geoJSON) }}>
                  {result.name}
                </a>
              )
            })
          }
        </div>
      )
    } else {
      results = (
        <p>{this.__('Use the box above to search')}</p>
      )
    }

    let searchLabel = ''
    if (this.state.tab === 'data') {
      searchLabel = this.__('Search Data')
    } else if (this.state.tab === 'location') {
      searchLabel = this.__('Find Place or Address')
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
                  onClick={function () { _this.onClickResult(result.feature) }}>
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
          title={this.__('Search')}
          position='bottom' inertia followCursor
        >
          <a ref='mapSearchButton'
            className='map-search-button sidenav-trigger'
            href='#'
            data-target='map-search-panel'
            onMouseDown={this.onPanelOpen}
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
        <div ref='sidenav' className='sidenav' id='map-search-panel'
          style={{
            backgroundColor: '#FFF',
            height: '100%',
            paddingLeft: '5px',
            paddingRight: '5px',
            paddingBottom: '5px',
            paddingTop: '25px',
            position: 'absolute',
            width: '240px',
            border: '1px solid #d3d3d3'}}>
          <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.closePanel}>
            <i className='material-icons selected-feature-close' style={{fontSize: '20px'}}>close</i>
          </a>
          <SearchBar id={'map-search-bar'}
            placeholder={searchLabel}
            onChange={this.onSearch}
            onSubmit={this.onSubmit}
            onReset={this.onReset} />
          <ul ref='tabs' className='tabs tabs-fixed-width'>
            <li className='tab' onClick={function () { _this.selectTab('data') }}><a className='active' href='#map-search-data'>{this.__('Data')}</a></li>
            <li className='tab' onClick={function () { _this.selectTab('location') }}><a href='#map-search-location'>{this.__('Location')}</a></li>
          </ul>
          <div id='map-search-data'>
            {results}
          </div>
          <div id='map-search-location'>
            {locationResults}
          </div>
        </div>
      </div>
    )
  }
}
