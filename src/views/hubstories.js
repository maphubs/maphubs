// @flow
import React from 'react'
import isEmpty from 'lodash.isempty'
import HubBanner from '../components/Hub/HubBanner'
import HubStories from '../components/Hub/HubStories'
import HubNav from '../components/Hub/HubNav'
import HubEditButton from '../components/Hub/HubEditButton'
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
  stories: Array<Object>,
  canEdit: boolean,
  locale: string,
  footerConfig: Object,
  _csrf: string,
  user: Object
}

type DefaultProps = {
  hub: Object,
  stories: Array<Object>,
  canEdit: boolean
}

type State = {
   editing: boolean
} & LocaleStoreState & HubStoreState

export default class HubStoriesPage extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    hub: {
      name: 'Unknown'
    },
    stories: [],
    canEdit: false
  }

  state: State = {
    editing: false,
    hub: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(HubStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(HubStore, {hub: this.props.hub, stories: this.props.stories})
  }

  startEditing = () => {
    this.setState({editing: true})
  }

  stopEditing = () => {
    const _this = this
    HubActions.saveHub(this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: _this.__('Hub Saved')})
        _this.setState({editing: false})
      }
    })
  }

  publish = () => {
    const _this = this
    const hub = this.state.hub ? this.state.hub : {}
    if (this.state.unsavedChanges) {
      MessageActions.showMessage({
        title: _this.__('Unsaved Changes'),
        message: _this.__('Please save your changes before publishing.')
      })
    } else if (isEmpty(hub.name) || isEmpty(hub.description) ||
            !hub.hasLogoImage || !hub.hasBannerImage) {
      MessageActions.showMessage({title: _this.__('Required Content'), message: _this.__('Please complete your hub before publishing. Add a title, description, logo image, and banner image. \n We also recommend adding map layers and publishing your first story.')})
    } else {
      HubActions.publish(this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: _this.__('Server Error'), message: err})
        } else {
          NotificationActions.showNotification({message: _this.__('Hub Published')})
        }
      })
    }
  }

  render () {
    let editButton = ''
    let publishButton = ''

    if (this.props.canEdit) {
      editButton = (
        <HubEditButton editing={this.state.editing}
          startEditing={this.startEditing} stopEditing={this.stopEditing} />
      )

      if (!this.state.hub.published) {
        publishButton = (
          <div className='center center-align' style={{margin: 'auto', position: 'fixed', top: '15px', right: 'calc(50% - 60px)'}}>
            <button className='waves-effect waves-light btn' onClick={this.publish}>{this.__('Publish')}</button>
          </div>
        )
      }
    }

    return (
      <ErrorBoundary>
        <HubNav hubid={this.props.hub.hub_id} canEdit={this.props.canEdit} />
        <main style={{marginTop: '0px'}}>
          {publishButton}
          <div className='row'>
            <HubBanner editing={false} hubid={this.props.hub.hub_id} subPage />
          </div>
          <div className='container'>
            <div className='row'>
              <HubStories hub={this.props.hub}
                editing={this.state.editing}
                stories={this.props.stories} limit={6} />
            </div>
          </div>
          {editButton}
          <Footer {...this.props.footerConfig} />
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </ErrorBoundary>
    )
  }
}
