// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'

type Props = {
  maps: Array<Object>,
  user: Object,
  myMaps: boolean,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
}

export default class UserMaps extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps = {
    maps: [],
    user: {},
    myMaps: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
  }

  render () {
    const cards = this.props.maps.map(cardUtil.getMapCard)

    let createMaps = ''
    if (this.props.myMaps) {
      createMaps = (
        <div>
          <div className='fixed-action-btn action-button-bottom-right tooltipped' data-position='top' data-delay='50' data-tooltip={this.__('Create New Map')}>
            <a href='/map/new' className='btn-floating btn-large red red-text'>
              <i className='large material-icons'>add</i>
            </a>
          </div>
        </div>
      )
    }

    let myMaps = ''
    if (!this.props.maps || this.props.maps.length === 0) {
      myMaps = (
        <div className='row' style={{height: 'calc(100% - 100px)'}}>
          <div className='valign-wrapper' style={{height: '100%'}}>
            <div className='valign align-center center-align' style={{width: '100%'}}>
              <h5>{this.__('Click the button below to create your first map')}</h5>
            </div>
          </div>
        </div>
      )
    } else {
      myMaps = (
        <div className='row'>
          <div className='col s12'>
            <h4>{this.__('My Maps')}</h4>
            <CardCarousel infinite={false} cards={cards} />
          </div>
        </div>
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 70px)'}}>
          {myMaps}
          {createMaps}
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
