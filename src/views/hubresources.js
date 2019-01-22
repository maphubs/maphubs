// @flow
import React from 'react'
import isEmpty from 'lodash.isempty'
import HubBanner from '../components/Hub/HubBanner'
import HubNav from '../components/Hub/HubNav'
import HubEditButton from '../components/Hub/HubEditButton'
import HubResources from '../components/Hub/HubResources'
import HubStore from '../stores/HubStore'
import HubActions from '../actions/HubActions'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import Notification from '../components/Notification'
import Message from '../components/message'
import Confirmation from '../components/confirmation'
import Footer from '../components/footer'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {HubStoreState} from '../stores/HubStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  hub: Object,
  canEdit?: boolean,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  user: Object
}

type State = {
  editing: boolean
} & LocaleStoreState & HubStoreState

export default class HubResourcesPage extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    hub: {
      name: 'Unknown'
    }
  }

  state: State = {
    editing: false,
    hub: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(HubStore)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(HubStore, {
      hub: props.hub,
      canEdit: props.canEdit
    })
  }

  componentDidMount () {
    const {t} = this
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.state.editing) {
        const msg = t('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  startEditing = () => {
    this.setState({editing: true})
  }

  stopEditing = () => {
    const {t} = this
    const _this = this
    HubActions.saveHub(this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: t('Hub Saved')})
        _this.setState({editing: false})
      }
    })
  }

  publish = () => {
    const {t} = this
    if (this.state.unsavedChanges) {
      MessageActions.showMessage({title: t('Unsaved Changes'), message: t('Please save your changes before publishing.')})
    } else if (isEmpty(this.state.hub.name) || isEmpty(this.state.hub.description) ||
            !this.state.hub.hasLogoImage || !this.state.hub.hasBannerImage) {
      MessageActions.showMessage({title: t('Required Content'), message: t('Please complete your hub before publishing. Add a title, description, logo image, and banner image. \n We also recommend adding map layers and publishing your first story.')})
    } else {
      HubActions.publish(this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: t('Server Error'), message: err})
        } else {
          NotificationActions.showNotification({message: t('Hub Published')})
        }
      })
    }
  }

  render () {
    const {t} = this
    const {canEdit} = this.props
    const {editing} = this.state

    return (
      <ErrorBoundary>
        <HubNav hubid={this.props.hub.hub_id} canEdit={canEdit} />
        <main style={{marginTop: '0px'}}>
          {(canEdit && !this.state.hub.published) &&
            <div className='center center-align' style={{margin: 'auto', position: 'fixed', top: '15px', right: 'calc(50% - 60px)'}}>
              <button className='waves-effect waves-light btn' onClick={this.publish}>{t('Publish')}</button>
            </div>
          }
          <div className='row'>
            <HubBanner editing={false} hubid={this.props.hub.hub_id} subPage />
          </div>
          <div className='container'>
            <HubResources editing={editing} />
          </div>
          {canEdit &&
            <HubEditButton editing={editing}
              startEditing={this.startEditing} stopEditing={this.stopEditing} />
          }
          <Footer {...this.props.footerConfig} />
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </ErrorBoundary>
    )
  }
}
