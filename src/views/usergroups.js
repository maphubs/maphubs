// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
// var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('usermaps');
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

type Props = {|
  groups: Array<Group>,
  user: Object,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
|}

type DefaultProps = {
  groups: Array<Object>,
  user: Object,
  canEdit: boolean,
}

export default class UserGroups extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: DefaultProps = {
    groups: [],
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
    const {t} = this
    const {canEdit, user} = this.props

    let groups = ''
    if (this.props.groups && this.props.groups.length > 0) {
      const cards = this.props.groups.map(cardUtil.getGroupCard)
      groups = (
        <div className='row'>
          <div className='col s12 no-padding'>
            <CardCarousel infinite={false} cards={cards} t={this.t} />
          </div>
        </div>
      )
    } else {
      groups = (
        <div className='row' style={{height: 'calc(100% - 100px)'}}>
          <div className='valign-wrapper' style={{height: '100%'}}>
            <div className='valign align-center center-align' style={{width: '100%'}}>
              <h5>{t('Click the button below to create your first group')}</h5>
            </div>
          </div>
        </div>
      )
    }
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{marginLeft: '10px', marginRight: '10px'}}>
          {canEdit &&
            <h4>{t('My Groups')}</h4>
          }
          {!canEdit &&
            <h4>{t('Groups for user: ') + user.display_name}</h4>
          }
          {groups}
          {canEdit &&
            <div>
              <div className='fixed-action-btn action-button-bottom-right'>
                <FloatingButton
                  href='/creategroup'
                  tooltip={t('Create New Group')} tooltipPosition='top'
                  icon='add' />
              </div>
            </div>
          }
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
