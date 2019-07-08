// @flow
import React from 'react'
import Header from '../components/header'
import LayerSettings from '../components/CreateLayer/LayerSettings'
import LayerAdminSettings from '../components/CreateLayer/LayerAdminSettings'
import PresetEditor from '../components/CreateLayer/PresetEditor'
import LayerStyle from '../components/CreateLayer/LayerStyle'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import ConfirmationActions from '../actions/ConfirmationActions'
import Progress from '../components/Progress'
import request from 'superagent'
import _uniq from 'lodash.uniq'
import _mapvalues from 'lodash.mapvalues'
import LayerActions from '../actions/LayerActions'
import LayerStore from '../stores/layer-store'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import slugify from 'slugify'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import UserStore from '../stores/UserStore'
import ErrorBoundary from '../components/ErrorBoundary'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {Layer} from '../types/layer'
import type {LayerStoreState} from '../stores/layer-store'
import type {Group} from '../stores/GroupStore'
import type {UserStoreState} from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  layer: Layer,
  groups: Array<Group>,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

type State = {
  tab: string,
  canSavePresets: boolean,
  saving?: boolean
} & LocaleStoreState & LayerStoreState & UserStoreState

export default class LayerAdmin extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State = {
    tab: 'settings',
    canSavePresets: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.stores.push(UserStore)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(LayerStore, props.layer)

    let baseMapContainerInit = {bingKey: MAPHUBS_CONFIG.BING_KEY, tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY, mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
    
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions, bingKey: MAPHUBS_CONFIG.BING_KEY, tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY, mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()

    LayerActions.loadLayer()
  }

  componentDidMount () {
    M.Tabs.init(this.refs.tabs, {})
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
  }

  saveStyle = () => {
    const {t} = this
    LayerActions.saveStyle(this.state, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: t('Layer Saved'), dismissAfter: 2000})
      }
    })
  }

  onSave = () => {
    NotificationActions.showNotification({message: this.t('Layer Saved'), dismissAfter: 2000})
  }

  savePresets = () => {
    const {t} = this
    const _this = this
    // check for duplicate presets
    if (this.state.presets) {
      const presets = this.state.presets.toArray()
      const tags = _mapvalues(presets, 'tag')
      const uniqTags = _uniq(tags)
      if (tags.length > uniqTags.length) {
        MessageActions.showMessage({title: t('Data Error'), message: t('Duplicate tag, please choose a unique tag for each field')})
      } else {
        // save presets
        LayerActions.submitPresets(false, this.state._csrf, (err) => {
          if (err) {
            MessageActions.showMessage({title: t('Server Error'), message: err})
          } else {
            _this.saveStyle()
          }
        })
      }
    }
  }

  presetsValid = () => {
    this.setState({canSavePresets: true})
  }

  presetsInvalid = () => {
    this.setState({canSavePresets: false})
  }

  deleteLayer = () => {
    const {t} = this
    const _this = this
    ConfirmationActions.showConfirmation({
      title: t('Confirm Delete'),
      message: t('Please confirm removal of') + ' ' +
      t(this.props.layer.name) + '. ' +
      t('All additions, modifications, and feature notes will be deleted. This layer will also be removed from all maps, and stories.'),
      onPositiveResponse () {
        _this.setState({saving: true})
        LayerActions.deleteLayer(_this.state._csrf, (err) => {
          _this.setState({saving: false})
          if (err) {
            MessageActions.showMessage({title: t('Server Error'), message: err})
          } else {
            NotificationActions.showNotification({
              message: t('Layer Deleted'),
              dismissAfter: 1000,
              onDismiss () {
                window.location = '/'
              }
            })
          }
        })
      }
    })
  }

  refreshRemoteLayer = () => {
    const {t} = this
    request.post('/api/layer/refresh/remote')
      .type('json').accept('json')
      .send({
        layer_id: this.props.layer.layer_id
      })
      .end((err, res) => {
        checkClientError(res, err, () => {}, (cb) => {
          if (err) {
            MessageActions.showMessage({title: t('Server Error'), message: err})
          } else {
            NotificationActions.showNotification({message: t('Layer Updated'), dismissAfter: 2000})
          }
          cb()
        })
      })
  }

  selectTab = (tab: string) => {
    this.setState({tab})
  }

  render () {
    const {t} = this
    const _this = this
    let tabContentDisplay = 'none'
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit'
    }
    const layerId = this.props.layer.layer_id ? this.props.layer.layer_id : 0
    const layerName = slugify(this.t(this.props.layer.name))
    const layerInfoUrl = `/layer/info/${layerId}/${layerName}`

    if (this.props.layer.remote) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <div className='row'>
                <div className='col s12'>
                  <p>&larr; <a href={layerInfoUrl}>{t('Back to Layer')}</a></p>
                </div>
              </div>
              <div className='row center-align'>
                <h5>{t('Unable to modify remote layers.')}</h5>
                <div className='center-align center'>
                  <button className='btn' style={{marginTop: '20px'}}
                    onClick={this.refreshRemoteLayer}>{t('Refresh Remote Layer')}</button>
                </div>
                <p>{t('You can remove this layer using the button in the bottom right.')}</p>
              </div>
              <div ref={(el) => { this.menuButton = el }}
                className='fixed-action-btn action-button-bottom-right'>
                <FloatingButton
                  onClick={this.deleteLayer}
                  tooltip={t('Delete Layer')}
                  color='red' icon='delete' />
              </div>
            </div>
          </main>
        </ErrorBoundary>
      )
    } else {
      return (
        <ErrorBoundary>
          <Provider inject={[this.BaseMapState, this.MapState]}>
            <Header {...this.props.headerConfig} />
            <main>
              <div>
                <div className='row'>
                  <div className='col s12'>
                    <p>&larr; <a href={layerInfoUrl}>{t('Back to Layer')}</a></p>
                    <ul ref='tabs' className='tabs' style={{overflowX: 'hidden'}}>
                      <li className='tab'>
                        <a className='active' onClick={() => { _this.selectTab('settings') }} href='#info'>{t('Info/Settings')}</a>
                      </li>
                      <li className='tab'>
                        <a onClick={() => { _this.selectTab('fields') }} href='#fields'>{t('Fields')}</a>
                      </li>
                      <li className='tab'>
                        <a onClick={() => { _this.selectTab('style') }} href='#style'>{t('Style/Display')}</a>
                      </li>
                      {this.state.user && this.state.user.admin &&
                      <li className='tab'>
                        <a onClick={() => { _this.selectTab('admin') }} href='#admin'>{t('Admin Only')}</a>
                      </li>
                      }
                    </ul>
                  </div>
                  <div id='info' className='col s12' style={{borderTop: '1px solid #ddd'}}>
                    {this.state.tab === 'settings' &&
                    <LayerSettings
                      groups={this.props.groups}
                      showGroup={false}
                      warnIfUnsaved
                      onSubmit={this.onSave}
                      submitText={t('Save')}
                    />
                    }
                  </div>
                  <div id='fields' className='col s12' style={{display: tabContentDisplay, borderTop: '1px solid #ddd'}}>
                    {this.state.tab === 'fields' &&
                    <div className='container' >
                      <h5>{t('Data Fields')}</h5>
                      <div className='right'>
                        <button onClick={this.savePresets} className='waves-effect waves-light btn' disabled={!this.state.canSavePresets}>{t('Save')}</button>
                      </div>
                      <PresetEditor onValid={this.presetsValid} onInvalid={this.presetsInvalid} />
                      <div className='right'>
                        <button onClick={this.savePresets} className='waves-effect waves-light btn' disabled={!this.state.canSavePresets}>{t('Save')}</button>
                      </div>
                    </div>
                    }
                  </div>
                  <div id='style' className='col s12' style={{display: tabContentDisplay, borderTop: '1px solid #ddd'}}>
                    {this.state.tab === 'style' &&
                    <LayerStyle
                      showPrev={false}
                      onSubmit={this.onSave}
                      mapConfig={this.props.mapConfig}
                    />
                    }
                  </div>
                  <div id='admin' className='col s12' style={{display: tabContentDisplay, borderTop: '1px solid #ddd'}}>
                    {this.state.tab === 'admin' &&
                    <LayerAdminSettings
                      groups={this.props.groups}
                      warnIfUnsaved
                      onSubmit={this.onSave}
                      submitText={t('Save')}
                    />
                    }
                  </div>
                </div>
              </div>
              <div ref={(el) => { this.menuButton = el }} className='fixed-action-btn action-button-bottom-right'>
                <a className='btn-floating btn-large red red-text'>
                  <i className='large material-icons'>settings</i>
                </a>
                <ul>
                  <li>
                    <FloatingButton
                      href={`/layer/replace/${layerId}/${layerName}`}
                      tooltip={t('Replace Layer Data')}
                      color='blue' icon='file_upload' large={false} />
                  </li>
                  <li>
                    <FloatingButton
                      onClick={this.deleteLayer}
                      tooltip={t('Delete Layer')}
                      color='red' icon='delete' large={false} />
                  </li>
                </ul>
              </div>
              <Progress id='saving-layer-admin' title={t('Sending')} subTitle='' dismissible={false} show={this.state.saving} />
            </main>
          </Provider>
        </ErrorBoundary>
      )
    }
  }
}
