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
import LayerList from '../components/Lists/LayerList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import type {Layer} from '../types/layer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

import cardUtil from '../services/card-util'
const checkClientError = require('../services/client-error-response').checkClientError
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/layers')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

type Props = {
  layers: Array<Layer>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean,
  showList: boolean
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
    searchActive: false,
    showList: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.refs.addButton, {})
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
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.layers && res.body.layers.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.layers})
              NotificationActions.showNotification({message: res.body.layers.length + ' ' + t('Results'), position: 'bottomleft'})
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

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
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

    let layers = ''
    if (this.state.showList) {
      layers = (
        <div className='container'>
          <LayerList showTitle={false} layers={this.props.layers} />
        </div>
      )
    } else {
      const cards = this.props.layers.map(cardUtil.getLayerCard)
      layers = (
        <CardGrid cards={cards} t={t} />
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
                <p style={{fontSize: '16px', margin: 0}}>{t('Browse layers or create a new layer.')}</p>
              </div>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={t('Search Layers')} suggestionUrl='/api/layers/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </div>
            </div>
          </div>
          {searchResults}

          <div className='row'>
            <div className='left-align' style={{marginLeft: '15px', marginTop: '25px'}}>
              <Formsy>
                <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={this.state.showList} />
              </Formsy>
            </div>
            <div className='row'>
              {layers}
            </div>
          </div>

          <div ref='addButton' className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createlayer'
              tooltip={t('Create New Layer')}
              tooltipPosition='top'
              icon='add' />
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
