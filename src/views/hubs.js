// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import urlUtil from '../services/url-util'
import cardUtil from '../services/card-util'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const checkClientError = require('../services/client-error-response').checkClientError
const debug = require('../services/debug')('views/hubs')

type Props = {
  featuredHubs: Array<Object>,
  popularHubs: Array<Object>,
  recentHubs: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  searchActive: boolean,
  searchResults: Array<Object>
}

export default class Hubs extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    featuredHubs: [],
    popularHubs: [],
    recentHubs: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  handleSearch = (input: string) => {
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/hubs/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.hubs && res.body.hubs.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.hubs})
              NotificationActions.showNotification({message: res.body.hubs.length + ' ' + _this.__('Results'), position: 'bottomleft'})
            } else {
            // show error message
              NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'bottomleft'})
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
    const featuredCards = this.props.featuredHubs.map(cardUtil.getHubCard)
    const recentCards = this.props.recentHubs.map(cardUtil.getHubCard)
    const popularCards = this.props.popularHubs.map(cardUtil.getHubCard)

    let searchResults = ''
    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getHubCard)
        searchResults = (
          <CardCollection cards={searchCards} title={this.__('Search Results')} />
        )
      } else {
        searchResults = (
          <div className='row'>
            <div className='col s12'>
              <h5>{this.__('Search Results')}</h5>
              <div className='divider' />
              <p><b>{this.__('No Results Found')}</b></p>
            </div>
          </div>
        )
      }
    }

    let featured = ''
    if (featuredCards.length > 0) {
      featured = (<CardCollection cards={featuredCards} title={this.__('Featured')} viewAllLink='/hubs/all' />)
    }

    return (
      <ErrorBoundary>
        <Header activePage='hubs' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '20px'}}>
            <div className='row'>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={this.__('Search Hubs')}
                  suggestionUrl='/api/hubs/search/suggestions'
                  onSearch={this.handleSearch} onReset={this.resetSearch} />
              </div>
            </div>
          </div>

          {searchResults}
          {featured}
          <CardCollection cards={popularCards} title={this.__('Popular')} viewAllLink='/hubs/all' />
          <CardCollection cards={recentCards} title={this.__('Recent')} viewAllLink='/hubs/all' />

          <div className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createhub'
              tooltip={this.__('Create New Hub')}
              tooltipPosition='top'
              icon='add' />
          </div>
          <div className='row center-align'>
            <a className='btn' href='/hubs/all'>{this.__('View All Hubs')}</a>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
