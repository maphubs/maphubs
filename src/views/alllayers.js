// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { message, notification, Row, Col, Typography } from 'antd'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import request from 'superagent'
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
import FloatingAddButton from '../components/FloatingAddButton'
import cardUtil from '../services/card-util'

const { Title } = Typography
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

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    const { layers } = this.props
    const { showList, searchActive } = this.state
    let searchResults = ''

    if (searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getLayerCard)
        searchResults = (
          <CardCollection title={t('Search Results')} cards={searchCards} />
        )
      } else {
        searchResults = (
          <Row>
            <h5>{t('Search Results')}</h5>
            <div className='divider' />
            <p><b>{t('No Results Found')}</b></p>
          </Row>
        )
      }
    }

    return (
      <ErrorBoundary>
        <Header activePage='layers' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <Col sm={12} md={8}>
                <Title level={2}>{t('Layers')}</Title>
              </Col>
              <Col sm={12} md={8} offset={8} style={{textAlign: 'right', paddingTop: '2px'}}>
                <SearchBox label={t('Search Layers')} suggestionUrl='/api/layers/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
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
          </Row>
          <Row>
            {showList &&
              <div className='container'>
                <LayerList showTitle={false} layers={this.props.layers} t={t} />
              </div>}
            {!showList &&
              <CardGrid cards={layers.map(cardUtil.getLayerCard)} t={t} />}
          </Row>
          <FloatingAddButton
            onClick={() => {
              window.location = '/createlayer'
            }}
            tooltip={t('Create New Layer')}
          />
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
