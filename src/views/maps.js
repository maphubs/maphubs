// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { message, notification, Row, Divider, Col } from 'antd'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import cardUtil from '../services/card-util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/maps')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  featuredMaps: Array<Object>,
  recentMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}

export default class Maps extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State = {
    searchResults: [],
    searchActive: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  handleSearch = (input: string) => {
    const {t} = this
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/maps/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            if (res.body.maps && res.body.maps.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.maps})
              message.info(`${res.body.layers.length} ${t('Results')}`)
            } else {
              message.info(t('No Results Found'), 5)
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: []})
  }

  render () {
    const {t} = this
    const featuredCards = this.props.featuredMaps.map(cardUtil.getMapCard)
    const recentCards = this.props.recentMaps.map(cardUtil.getMapCard)
    const popularCards = this.props.popularMaps.map(cardUtil.getMapCard)

    let searchResults = ''
    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getMapCard)

        searchResults = (
          <CardCollection title={t('Search Results')} cards={searchCards} />
        )
      } else {
        searchResults = (
          <Row>
            <h5>{t('Search Results')}</h5>
            <Divider />
            <p><b>{t('No Results Found')}</b></p>
          </Row>
        )
      }
    }

    let featured = ''
    if (!MAPHUBS_CONFIG.mapHubsPro && featuredCards && featuredCards.length > 0) {
      featured = (
        <CardCollection title={t('Featured')} cards={featuredCards} viewAllLink='/maps/all' />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <Col sm={24} md={14} lg={16}>
                <h4 className='no-margin'>{t('Maps')}</h4>
              </Col>
              <Col sm={24} md={8} lg={6} style={{paddingRight: '15px'}}>
                <SearchBox label={t('Search Maps')} suggestionUrl='/api/maps/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </Col>
            </Row>
          </div>
          {searchResults}
          {featured}
          <CardCollection title={t('Popular')} cards={popularCards} viewAllLink='/maps/all' />
          <CardCollection title={t('Recent')} cards={recentCards} viewAllLink='/maps/all' />

          <div>
            <div className='fixed-action-btn action-button-bottom-right'>
              <FloatingButton
                href='/map/new'
                tooltip={t('Create New Map')} tooltipPosition='top'
                icon='add'
              />
            </div>
          </div>
          <Row style={{textAlign: 'center'}}>
            <a className='btn' href='/maps/all'>{t('View All Maps')}</a>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
