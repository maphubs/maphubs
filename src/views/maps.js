// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import request from 'superagent'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

import cardUtil from '../services/card-util'
const debug = require('../services/debug')('views/maps')
const urlUtil = require('../services/url-util')
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
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
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
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.maps && res.body.maps.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.maps})
              NotificationActions.showNotification({message: res.body.maps.length + ' ' + t('Results'), position: 'bottomleft'})
            } else {
            // show error message
              NotificationActions.showNotification({message: t('No Results Found'), dismissAfter: 5000, position: 'bottomleft'})
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
          <div className='row'>
            <div className='col s12'>
              <h5>{t('Search Results')}</h5>
              <div className='divider' />
              <p><b>{t('No Results Found')}</b></p>
            </div>
          </div>
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
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className='row' style={{marginBottom: '0px'}}>
              <div className='col l8 m7 s12'>
                <h4 className='no-margin'>{t('Maps')}</h4>
              </div>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={t('Search Maps')} suggestionUrl='/api/maps/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </div>
            </div>
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
                icon='add' />
            </div>
          </div>
          <div className='row center-align'>
            <a className='btn' href='/maps/all'>{t('View All Maps')}</a>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
