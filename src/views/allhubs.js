// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import cardUtil from '../services/card-util'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import HubList from '../components/Lists/HubList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/hubs')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  hubs: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  searchActive: boolean,
  searchResults: Array<Object>,
  showList?: boolean
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
    request.get(urlUtil.getBaseUrl() + '/api/hubs/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.hubs && res.body.hubs.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.hubs})
              NotificationActions.showNotification({message: res.body.hubs.length + ' ' + t('Results'), position: 'bottomleft'})
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
        const searchCards = this.state.searchResults.map(cardUtil.getHubCard)
        searchResults = (
          <CardCollection cards={searchCards} title={t('Search Results')} t={t} />
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

    let hubs = ''
    if (this.state.showList) {
      hubs = (
        <div className='container'>
          <HubList showTitle={false} hubs={this.props.hubs} />
        </div>
      )
    } else {
      const cards = this.props.hubs.map(cardUtil.getHubCard)
      hubs = (
        <CardGrid cards={cards} t={t} />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='hubs' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '20px'}}>
            <div className='row'>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={t('Search Hubs')}
                  suggestionUrl='/api/hubs/search/suggestions'
                  onSearch={this.handleSearch} onReset={this.resetSearch} />
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
              {hubs}
            </div>
          </div>

          <div ref='addButton' className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createhub' icon='add'
              tooltip={t('Create New Hub')} tooltipPosition='top' />
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
