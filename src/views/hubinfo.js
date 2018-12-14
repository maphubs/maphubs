// @flow
import React from 'react'
import isEmpty from 'lodash.isempty'
import HubBanner from '../components/Hub/HubBanner'
import HubMap from '../components/Hub/HubMap'
import HubStories from '../components/Hub/HubStories'
import HubNav from '../components/Hub/HubNav'
import HubEditButton from '../components/Hub/HubEditButton'
import HubResources from '../components/Hub/HubResources'
import HubDescription from '../components/Hub/HubDescription'
import HubStore from '../stores/HubStore'
import HubActions from '../actions/HubActions'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import Notification from '../components/Notification'
import Message from '../components/message'
import Confirmation from '../components/confirmation'
import Footer from '../components/footer'
import Progress from '../components/Progress'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {HubStoreState} from '../stores/HubStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'

type Props = {
  hub: Object,
  map: Object,
  layers: Array<Object>,
  stories: Array<Object>,
  canEdit: boolean,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  mapConfig: Object,
  user: Object
}

type State = {
  editing: boolean
} & LocaleStoreState & HubStoreState

export default class HubInfo extends MapHubsComponent<Props, State> {
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
    },
    layers: [],
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
    Reflux.rehydrate(HubStore, {hub: this.props.hub, map: this.props.map, layers: this.props.layers, stories: this.props.stories, canEdit: this.props.canEdit})

    let baseMapContainerInit = {}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
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
        window.location.reload(true)
      }
    })
  }

  publish = () => {
    const {t} = this
    if (this.state.unsavedChanges) {
      MessageActions.showMessage({title: t('Unsaved Changes'), message: t('Please save your changes before publishing.')})
    } else if (isEmpty(this.state.hub.name) ||
      !this.state.hub.hasLogoImage ||
      !this.state.hub.hasBannerImage) {
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
    let editButton
    let publishButton
    if (this.props.canEdit) {
      editButton = (
        <HubEditButton editing={this.state.editing}
          startEditing={this.startEditing} stopEditing={this.stopEditing} />
      )

      if (!this.state.hub.published) {
        publishButton = (
          <div className='center center-align' style={{margin: 'auto', position: 'fixed', top: '15px', zIndex: '1', right: 'calc(50% - 60px)'}}>
            <button className='waves-effect waves-light btn' onClick={this.publish}>{t('Publish')}</button>
          </div>
        )
      }
    }

    const linkBaseUrl = '/hub/' + this.props.hub.hub_id + '/'

    return (
      <ErrorBoundary>
        <HubNav hubid={this.props.hub.hub_id} canEdit={this.props.canEdit} />
        <main style={{marginTop: '0px'}}>

          <div className='row no-margin'>
            <HubBanner editing={this.state.editing} hubid={this.props.hub.hub_id} />
          </div>
          <div className='row'>

            <div className='row' style={{height: 'calc(100vh - 65px)'}}>
              <Provider inject={[this.BaseMapState, this.MapState]}>
                <HubMap editing={this.state.editing} height='calc(100vh - 65px)'
                  map={this.state.map} layers={this.state.layers}
                  hub={this.state.hub} myMaps={this.props.myMaps} popularMaps={this.props.popularMaps}
                  mapConfig={this.props.mapConfig}
                  border />
              </Provider>
            </div>
            <div className='row no-margin'>
              <HubDescription editing={this.state.editing} hubid={this.props.hub.hub_id} />
            </div>
            <div className='row'>
              <a href={linkBaseUrl + 'stories'}><h5 className='hub-section center-align' style={{marginLeft: '10px'}}>{t('Stories')}</h5></a>
              <div className='divider' />
              <div className='container'>
                <HubStories hub={this.props.hub}
                  editing={this.state.editing}
                  stories={this.props.stories} limit={3} />

              </div>
              <div className='center-align' style={{marginTop: '10px', marginBottom: '10px'}}>
                <a href={linkBaseUrl + 'stories'} className='btn'>{t('View More Stories')}</a>
              </div>
            </div>
            <div className='row' style={{minHeight: '200px'}}>
              <a href={linkBaseUrl + 'resources'}><h5 className='hub-section center-align' style={{marginLeft: '10px'}}>{t('Resources')}</h5></a>
              <div className='divider' />
              <div className='container'>
                <HubResources editing={this.state.editing} />
              </div>
              <div className='center-align' style={{marginTop: '10px', marginBottom: '10px'}}>
                <a href={linkBaseUrl + 'resources'} className='btn'>{t('View Resources')}</a>
              </div>
            </div>
          </div>

          {editButton}
          <Footer {...this.props.footerConfig} />
          {publishButton}
        </main>

        <Notification />
        <Message />
        <Confirmation />
        <Progress id='saving-hub' title={t('Saving')} subTitle='' dismissible={false} show={this.state.saving} />
      </ErrorBoundary>
    )
  }
}
