// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { message, notification, Row, Col, Button } from 'antd'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import request from 'superagent'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/groups')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  featuredGroups: Array<Object>,
  recentGroups: Array<Object>,
  popularGroups: Array<Object>,
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

export default class Groups extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    groups: []
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
    request.get(urlUtil.getBaseUrl() + '/api/groups/search?q=' + input)
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
            if (res.body.groups && res.body.groups.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.groups})
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
    const featuredCards = this.props.featuredGroups.map(cardUtil.getGroupCard)
    const popularCards = this.props.popularGroups.map(cardUtil.getGroupCard)
    const recentCards = this.props.recentGroups.map(cardUtil.getGroupCard)

    let searchResults = ''

    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getGroupCard)
        searchResults = (
          <CardCollection title={t('Search Results')} cards={searchCards} />
        )
      } else {
        searchResults = (
          <Row style={{marginBottom: '20px'}}>
            <h5>{t('Search Results')}</h5>
            <div className='divider' />
            <p><b>{t('No Results Found')}</b></p>
          </Row>
        )
      }
    }
    let featured = ''
    if (featuredCards.length > 0) {
      featured = (
        <CardCollection title={t('Featured')} cards={featuredCards} viewAllLink='/groups/all' />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='groups' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <Col sm={24} md={14} lg={16}>
                <h4 className='no-margin'>{t('Groups')}</h4>
                <p style={{fontSize: '16px', margin: 0}}>{t('Create a group for your organization or browse the content of existing groups.')}</p>
              </Col>
              <Col sm={24} md={8} lg={6} style={{paddingRight: '15px', textAlign: 'right'}}>
                <SearchBox label={t('Search Groups')} suggestionUrl='/api/groups/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </Col>
            </Row>
          </div>
          <div>

            {searchResults}

            {featured}
            <CardCollection title={t('Popular')} cards={popularCards} viewAllLink='/groups/all' />
            <CardCollection title={t('Recent')} cards={recentCards} viewAllLink='/groups/all' />

            <div className='fixed-action-btn action-button-bottom-right'>
              <FloatingButton
                href='/creategroup' icon='add'
                tooltip={t('Create New Group')} tooltipPosition='top'
              />
            </div>
          </div>
          <Row style={{marginBottom: '20px', textAlign: 'center'}}>
            <Button type='primary' href='/groups/all'>{t('View All Groups')}</Button>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
