// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { message, notification } from 'antd'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {Layer} from '../types/layer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import cardUtil from '../services/card-util'

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/layers')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  featuredLayers: Array<Layer>,
  recentLayers: Array<Layer>,
  popularLayers: Array<Layer>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}
export default class Layers extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state = {
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
    request.get(urlUtil.getBaseUrl() + '/api/layers/search?q=' + input)
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
            if (res.body.layers && res.body.layers.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.layers})
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
    const featuredCards = this.props.featuredLayers.map(cardUtil.getLayerCard)
    const recentCards = this.props.recentLayers.map(cardUtil.getLayerCard)
    const popularCards = this.props.popularLayers.map(cardUtil.getLayerCard)

    let searchResults = ''

    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getLayerCard)
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
    if (featuredCards.length > 0) {
      featured = (
        <CardCollection title={t('Featured')} cards={featuredCards} viewAllLink='/layers/all' />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='layers' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className='row' style={{marginBottom: '0px'}}>
              <div className='col l8 m7 s12'>
                <h4 className='no-margin'>{t('Layers')}</h4>
                <p style={{fontSize: '16px', margin: 0}}>{t('Browse map layers or create a new layer.')}</p>
              </div>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={t('Search Layers')} suggestionUrl='/api/layers/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </div>
            </div>
          </div>
          {searchResults}
          {featured}
          <CardCollection title={t('Popular')} cards={popularCards} viewAllLink='/layers/all' />
          <CardCollection title={t('Recent')} cards={recentCards} viewAllLink='/layers/all' />

          <div className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createlayer'
              tooltip={t('Create New Layer')}
              tooltipPosition='top'
              icon='add' />
          </div>
          <div className='row center-align'>
            <a className='btn' href='/layers/all'>{t('View All Layers')}</a>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
