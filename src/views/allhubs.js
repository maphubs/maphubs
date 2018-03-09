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
import HubList from '../components/Lists/HubList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

const debug = require('../services/debug')('views/hubs')
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
  props: Props

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

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
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
        <CardGrid cards={cards} />
      )
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

          <div className='row'>
            <div className='left-align' style={{marginLeft: '15px', marginTop: '25px'}}>
              <Formsy>
                <Toggle name='mode' onChange={this.onModeChange} labelOff={this.__('Grid')} labelOn={this.__('List')} checked={this.state.showList} />
              </Formsy>
            </div>
            <div className='row'>
              {hubs}
            </div>
          </div>

          <div ref='addButton' className='fixed-action-btn action-button-bottom-right tooltipped' data-position='top' data-delay='50' data-tooltip={this.__('Create New Hub')}>
            <a className='btn-floating btn-large red red-text' href='/createhub'>
              <i className='large material-icons'>add</i>
            </a>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
