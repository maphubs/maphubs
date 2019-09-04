// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, message, notification } from 'antd'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import request from 'superagent'
import _shuffle from 'lodash.shuffle'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import type {CardConfig} from '../components/CardCarousel/Card'
import UserStore from '../stores/UserStore'
import cardUtil from '../services/card-util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('home')

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
  searchCards: Array<CardConfig>
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
    searchCards: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  getParameterByName = (name: string, url: any) => {
    if (!url) url = window.location.href
    url = url.toLowerCase() // This is just to avoid case sensitiveness
    name = name.replace(/[\[\]]/g, '\\$&').toLowerCase()// This is just to avoid case sensitiveness for query parameter name
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    const results = regex.exec(url)
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

  onResetSearch = () => {
    this.setState({searchResult: null, searchCards: []})
  }

  handleSearch = async (input: string) => {
    const {t} = this
    const closeSearchingMessage = message.loading(t('Searching'), 0)
    try {
      let totalResults = 0

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

      // maps
      if (mapRes.body && mapRes.body.maps && mapRes.body.maps.length > 0) {
        totalResults += mapRes.body.maps.length
        mapResults = mapRes.body.maps
      }

      const searchCards = this.getMixedCardSet(layerResults, groupResults, mapResults, storyResults)
      this.setState({
        searchCards
      })

      closeSearchingMessage()

      if (totalResults > 0) {
        message.info(`${totalResults} ${t('Results Found')}`)
      } else {
        // clear Map
        // tell user no results found
        message.info(t('No Results Found'))
      }
    } catch (err) {
      closeSearchingMessage()
      debug.error(err)
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  getMixedCardSet (layers: Array<Object>, groups: Array<Object>, maps: Array<Object>, stories: Array<Object>) {
    return _shuffle(layers.map(cardUtil.getLayerCard)
      .concat(groups.map(cardUtil.getGroupCard))
      .concat(maps.map(cardUtil.getMapCard))
      .concat(stories.map(s => cardUtil.getStoryCard(s, this.t)))
    )
  }

  render () {
    const {t} = this

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{margin: 0}}>
          <Row>
            <div ref='search' className='container' style={{height: '55px', paddingTop: '10px'}}>
              <SearchBox
                label={t('Search') + ' ' + MAPHUBS_CONFIG.productName}
                onSearch={this.handleSearch}
                onReset={() => { this.onResetSearch() }}
              />
            </div>
          </Row>
          <Row style={{height: 'calc(100% - 50px)', minHeight: '200px'}}>
            {(this.state.searchCards && this.state.searchCards.length > 0) &&
              <CardCollection cards={this.state.searchCards} />}
          </Row>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
