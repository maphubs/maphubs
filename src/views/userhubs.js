// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
// var debug = require('../services/debug')('usermaps');
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

type Props = {
  draftHubs: Array<Object>,
  publishedHubs: Array<Object>,
  user: Object,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type DefaultProps = {
  draftHubs: Array<Object>,
  publishedHubs: Array<Object>,
  user: Object,
  canEdit: boolean
}

export default class UserHubs extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps: DefaultProps = {
    draftHubs: [],
    publishedHubs: [],
    user: {},
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    let addButton = ''
    let hubsMessage = ''
    if (this.props.canEdit) {
      addButton = (
        <div>
          <div className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createhub'
              tooltip={this.__('Create New Hub')} tooltipPosition='top'
              icon='add' />
          </div>
        </div>
      )

      hubsMessage = (
        <h4>{this.__('My Hubs')}</h4>
      )
    } else {
      hubsMessage = (
        <h4>{this.__('Hubs for user: ' + this.props.user.display_name)}</h4>
      )
    }

    let draftHubs = ''
    let hasDrafts = false
    if (this.props.draftHubs && this.props.draftHubs.length > 0) {
      const draftCards = this.props.draftHubs.map(cardUtil.getHubCard)
      draftHubs = (
        <div className='row'>
          <div className='col s12 no-padding'>
            <h5>{this.__('Draft Hubs')}</h5>
            <CardCarousel infinite={false} cards={draftCards} />
          </div>
        </div>
      )
      hasDrafts = true
    }

    let publishedHubs = ''
    let emptyMessage = ''
    let divider = ''
    let hasPubished = false
    if (this.props.publishedHubs && this.props.publishedHubs.length > 0) {
      const publishedCards = this.props.publishedHubs.map(cardUtil.getHubCard)
      publishedHubs = (
        <div className='row'>
          <div className='col s12 no-padding'>
            <h5>{this.__('Published Hubs')}</h5>
            <CardCarousel infinite={false} cards={publishedCards} />
          </div>
        </div>
      )
      if (hasDrafts) {
        divider = (
          <div className='divider' />
        )
      }
      hasPubished = true
    } else if (!hasDrafts && !hasPubished) {
      emptyMessage = (
        <div className='row' style={{height: 'calc(100% - 100px)'}}>
          <div className='valign-wrapper' style={{height: '100%'}}>
            <div className='valign align-center center-align' style={{width: '100%'}}>
              <h5>{this.__('Click the button below to create your first hub')}</h5>
            </div>
          </div>
        </div>
      )
    }
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{marginLeft: '10px', marginRight: '10px'}}>
          {hubsMessage}
          {draftHubs}
          {divider}
          {publishedHubs}
          {emptyMessage}
          {addButton}
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
