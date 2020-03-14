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
import MapList from '../components/Lists/MapList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

import cardUtil from '../services/card-util'
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/maps')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  maps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean,
  showList: boolean
}

export default class AllMaps extends MapHubsComponent<Props, State> {
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
    searchActive: false,
    showList: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
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

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    let searchResults = ''
    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getMapCard)

        searchResults = (
          <CardCollection title={t('Search Results')} cards={searchCards} t={t} />
        )
      } else {
        searchResults = (
          <Row style={{marginBottom: '20px'}}>
            <h5>{t('Search Results')}</h5>
            <Divider />
            <p><b>{t('No Results Found')}</b></p>
          </Row>
        )
      }
    }

    let maps = ''
    if (this.state.showList) {
      maps = (
        <div className='container'>
          <MapList showTitle={false} maps={this.props.maps} t={t} />
        </div>
      )
    } else {
      const cards = this.props.maps.map(cardUtil.getMapCard)
      maps = (
        <CardGrid cards={cards} t={t} />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row style={{marginBottom: '0px'}}>
              <Col sm={24} md={8}>
                <h4 className='no-margin'>{t('Maps')}</h4>
              </Col>
              <Col sm={24} md={8} offset={8} style={{paddingRight: '15px', textAlign: 'right'}}>
                <SearchBox label={t('Search Maps')} suggestionUrl='/api/maps/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </Col>
            </Row>
          </div>
          {searchResults}
          <Row justify='end' style={{marginBottom: '20px'}}>
            <Col style={{margin: '20px'}}>
              <Formsy>
                <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={this.state.showList} />
              </Formsy>
            </Col>
            <Row style={{marginBottom: '20px'}}>
              {maps}
            </Row>
          </Row>
          <div>
            <div ref='addButton' className='fixed-action-btn action-button-bottom-right'>
              <FloatingButton
                href='/map/new'
                tooltip={t('Create New Map')}
                tooltipPosition='top'
                icon='add'
              />
            </div>
          </div>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
