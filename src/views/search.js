// @flow
import React from 'react'
import Map from '../components/Map'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import request from 'superagent'
import _shuffle from 'lodash.shuffle'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import Progress from '../components/Progress'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider, Subscribe } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import ErrorBoundary from '../components/ErrorBoundary'
import type {CardConfig} from '../components/CardCarousel/Card'
import UserStore from '../stores/UserStore'
import cardUtil from '../services/card-util'
import MapContainer from '../components/Map/containers/MapContainer'

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('home')
const $ = require('jquery')

type Props = {
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  mapConfig: Object,
  _csrf: string,
  user: Object
}

type State = {
  searchResult: any,
  searchCards: Array<CardConfig>,
  searching: boolean
}

export default class Search extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State = {
    searchResult: null,
    searchCards: [],
    searching: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    let baseMapContainerInit = {}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
  }

  getParameterByName = (name: string, url: any) => {
    if (!url) url = window.location.href
    url = url.toLowerCase() // This is just to avoid case sensitiveness
    name = name.replace(/[\[\]]/g, '\\$&').toLowerCase()// This is just to avoid case sensitiveness for query parameter name
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    let results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  componentDidMount () {
    const q = this.getParameterByName('q')
    if (q) {
      this.handleSearch(q)
    }
  }

  componentDidUpdate () {
    if (this.state.searchResult) {
      const scrollTarget = $(this.refs.search)
      $('html,body').animate({
        scrollTop: scrollTarget.offset().top
      }, 1000)
    }
  }

  onResetSearch = (MapState: Object) => {
    MapState.state.map.resetGeoJSON()
    this.setState({searchResult: null, searchCards: []})
  }

  handleSearch = async (input: string) => {
    const {t} = this
    this.setState({searching: true})
    try {
      let totalResults = 0

      try {
        let featureRes = await request.get(`/api/global/search?q=${input}`).type('json').accept('json')
        if (featureRes.body && featureRes.body.features && featureRes.body.features.length > 0) {
          this.setState({
            searchResult: featureRes.body
          })
          totalResults += featureRes.body.features.length
        }
      } catch (err) {
        debug.error(err)
      }

      const layerRes = await request.get(`/api/layers/search?q=${input}`).type('json').accept('json')
      const groupRes = await request.get(`/api/groups/search?q=${input}`).type('json').accept('json')
      const mapRes = await request.get(`/api/maps/search?q=${input}`).type('json').accept('json')

      let layerResults = []
      let groupResults = []
      let mapResults = []
      const storyResults = []

      // layers
      if (layerRes.body && layerRes.body.layers && layerRes.body.layers.length > 0) {
        totalResults += layerRes.body.layers.length
        layerResults = layerRes.body.layers
      }

      // groups
      if (groupRes.body && groupRes.body.groups && groupRes.body.groups.length > 0) {
        totalResults += groupRes.body.groups.length
        groupResults = groupRes.body.groups
      }

      // map
      if (mapRes.body && mapRes.body.maps && mapRes.body.maps.length > 0) {
        totalResults += mapRes.body.maps.length
        mapResults = mapRes.body.maps
      }

      const searchCards = this.getMixedCardSet(layerResults, groupResults, mapResults, storyResults)
      this.setState({
        searchCards
      })

      this.setState({searching: false})

      if (totalResults > 0) {
        NotificationActions.showNotification(
          {
            message: totalResults +
             ' ' + t('Results Found'),
            position: 'bottomright',
            dismissAfter: 3000
          })
      } else {
        // clear Map
        // tell user no results found
        NotificationActions.showNotification(
          {
            message: t('No Results Found'),
            position: 'bottomright',
            dismissAfter: 3000
          })
      }
    } catch (err) {
      this.setState({searching: false})
      debug.error(err)
      MessageActions.showMessage({title: 'Error', message: err.toString()})
    }
  }

  getMixedCardSet (layers: Array<Object>, groups: Array<Object>, maps: Array<Object>, stories: Array<Object>) {
    return _shuffle(layers.map(cardUtil.getLayerCard)
      .concat(groups.map(cardUtil.getGroupCard))
      .concat(maps.map(cardUtil.getMapCard))
      .concat(stories.map(cardUtil.getStoryCard))
    )
  }

  render () {
    const {t} = this
    let cardsPanel = ''
    if (this.state.searchCards && this.state.searchCards.length > 0) {
      cardsPanel = (
        <CardCollection cards={this.state.searchCards} />
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main style={{margin: 0}}>
            <div ref='search' className='container' style={{height: '55px', paddingTop: '10px'}}>
              <Subscribe to={[MapContainer]}>
                {MapState => (
                  <div className='row no-margin'>
                    <SearchBox
                      label={t('Search') + ' ' + MAPHUBS_CONFIG.productName}
                      onSearch={this.handleSearch}
                      onReset={() => { this.onResetSearch(MapState) }}
                    />
                  </div>
                )}
              </Subscribe>
            </div>
            <div className='row no-margin' style={{height: 'calc(75vh - 55px)', minHeight: '200px'}}>
              <Map ref='map'
                id='global-search-map'
                style={{width: '100%', height: '100%'}}
                disableScrollZoom hoverInteraction={false} showLogo={false} attributionControl
                mapConfig={this.props.mapConfig}
                data={this.state.searchResult}
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                t={this.t}
              />
            </div>
            <div className='divider' />
            <div className='row no-margin' style={{height: 'calc(50% - 50px)', minHeight: '200px'}}>
              {cardsPanel}
            </div>
            <Progress id='searching' title={t('Searching')} subTitle='' dismissible={false} show={this.state.searching} />
          </main>
          <Footer {...this.props.footerConfig} />
        </Provider>
      </ErrorBoundary>
    )
  }
}
