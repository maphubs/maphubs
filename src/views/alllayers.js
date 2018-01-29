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
import type {Layer} from '../stores/layer-store'
import ErrorBoundary from '../components/ErrorBoundary'

const cardUtil = require('../services/card-util')
const checkClientError = require('../services/client-error-response').checkClientError
const debug = require('../services/debug')('views/layers')
const urlUtil = require('../services/url-util')

type Props = {
  layers: Array<Layer>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean,
  showList: boolean
}
export default class Layers extends MapHubsComponent<Props, State> {
  props: Props

  state = {
    searchResults: [],
    searchActive: false,
    showList: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
  }

  handleSearch = (input: string) => {
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
              NotificationActions.showNotification({message: res.body.layers.length + ' ' + _this.__('Results'), position: 'bottomleft'})
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
        const searchCards = this.state.searchResults.map(cardUtil.getLayerCard)
        searchResults = (
          <CardCollection title={this.__('Search Results')} cards={searchCards} />
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
        <CardGrid cards={cards} />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='layers' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className='row' style={{marginBottom: '0px'}}>
              <div className='col l8 m7 s12'>
                <h4 className='no-margin'>{this.__('Layers')}</h4>
                <p style={{fontSize: '16px', margin: 0}}>{this.__('Browse layers or create a new layer.')}</p>
              </div>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={this.__('Search Layers')} suggestionUrl='/api/layers/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
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
              {layers}
            </div>
          </div>

          <div className='fixed-action-btn action-button-bottom-right tooltipped' data-position='top' data-delay='50' data-tooltip={this.__('Create New Layer')}>
            <a href='/createlayer' className='btn-floating btn-large red red-text'>
              <i className='large material-icons'>add</i>
            </a>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
