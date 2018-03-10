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
import BaseMapStore from '../stores/map/BaseMapStore'
import slugify from 'slugify'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import UserStore from '../stores/UserStore'
import ErrorBoundary from '../components/ErrorBoundary'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {Layer, LayerStoreState} from '../stores/layer-store'
import type {Group} from '../stores/GroupStore'
import type {UserStoreState} from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const $ = require('jquery')
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
  props: Props

  state: State = {
    tab: 'settings',
    canSavePresets: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.stores.push(BaseMapStore)
    this.stores.push(UserStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(LayerStore, this.props.layer)
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }

    LayerActions.loadLayer()
  }

  componentDidMount () {
    $(this.refs.tabs).tabs()
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
  }

  saveStyle = () => {
    const _this = this
    LayerActions.saveStyle(this.state, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: this.__('Layer Saved'), dismissAfter: 2000})
      }
    })
  }

  onSave = () => {
    NotificationActions.showNotification({message: this.__('Layer Saved'), dismissAfter: 2000})
  }

  savePresets = () => {
    const _this = this
    // check for duplicate presets
    if (this.state.presets) {
      const presets = this.state.presets.toArray()
      const tags = _mapvalues(presets, 'tag')
      const uniqTags = _uniq(tags)
      if (tags.length > uniqTags.length) {
        MessageActions.showMessage({title: _this.__('Data Error'), message: this.__('Duplicate tag, please choose a unique tag for each field')})
      } else {
        // save presets
        LayerActions.submitPresets(false, this.state._csrf, (err) => {
          if (err) {
            MessageActions.showMessage({title: _this.__('Server Error'), message: err})
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
    const _this = this
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of') + ' ' +
      _this._o_(this.props.layer.name) + '. ' +
      _this.__('All additions, modifications, and feature notes will be deleted. This layer will also be removed from all maps, stories, and hubs.'),
      onPositiveResponse () {
        _this.setState({saving: true})
        LayerActions.deleteLayer(_this.state._csrf, (err) => {
          _this.setState({saving: false})
          if (err) {
            MessageActions.showMessage({title: _this.__('Server Error'), message: err})
          } else {
            NotificationActions.showNotification({
              message: _this.__('Layer Deleted'),
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
    const _this = this
    request.post('/api/layer/refresh/remote')
      .type('json').accept('json')
      .send({
        layer_id: this.props.layer.layer_id
      })
      .end((err, res) => {
        checkClientError(res, err, () => {}, (cb) => {
          if (err) {
            MessageActions.showMessage({title: _this.__('Server Error'), message: err})
          } else {
            NotificationActions.showNotification({message: _this.__('Layer Updated'), dismissAfter: 2000})
          }
          cb()
        })
      })
  }

  selectTab = (tab: string) => {
    this.setState({tab})
  }

  render () {
    const _this = this
    let tabContentDisplay = 'none'
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit'
    }
    const layerId = this.props.layer.layer_id ? this.props.layer.layer_id : 0
    const layerName = slugify(this._o_(this.props.layer.name))
    const layerInfoUrl = `/layer/info/${layerId}/${layerName}`

    if (this.props.layer.remote) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <div className='row'>
                <div className='col s12'>
                  <p>&larr; <a href={layerInfoUrl}>{this.__('Back to Layer')}</a></p>
                </div>
              </div>
              <div className='row center-align'>
                <h5>{this.__('Unable to modify remote layers.')}</h5>
                <div className='center-align center'>
                  <button className='btn' style={{marginTop: '20px'}}
                    onClick={this.refreshRemoteLayer}>{this.__('Refresh Remote Layer')}</button>
                </div>
                <p>{this.__('You can remove this layer using the button in the bottom right.')}</p>
              </div>
              <div ref={(el) => { this.menuButton = el }}
                className='fixed-action-btn action-button-bottom-right'>
                <FloatingButton
                  onClick={this.deleteLayer}
                  tooltip={this.__('Delete Layer')}
                  color='red' icon='delete' />
              </div>
            </div>
          </main>
        </ErrorBoundary>
      )
    } else {
      return (
        <div>
          <Header {...this.props.headerConfig} />
          <main>
            <div>
              <div className='row'>
                <div className='col s12'>
                  <p>&larr; <a href={layerInfoUrl}>{this.__('Back to Layer')}</a></p>
                  <ul ref='tabs' className='tabs' style={{overflowX: 'hidden'}}>
                    <li className='tab'>
                      <a className='active' onClick={function () { _this.selectTab('settings') }} href='#info'>{this.__('Info/Settings')}</a>
                    </li>
                    <li className='tab'>
                      <a onClick={function () { _this.selectTab('fields') }} href='#fields'>{this.__('Fields')}</a>
                    </li>
                    <li className='tab'>
                      <a onClick={function () { _this.selectTab('style') }} href='#style'>{this.__('Style/Display')}</a>
                    </li>
                    {this.state.user && this.state.user.admin &&
                    <li className='tab'>
                      <a onClick={function () { _this.selectTab('admin') }} href='#admin'>{this.__('Admin Only')}</a>
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
                    submitText={this.__('Save')}
                  />
                  }
                </div>
                <div id='fields' className='col s12' style={{display: tabContentDisplay, borderTop: '1px solid #ddd'}}>
                  {this.state.tab === 'fields' &&
                  <div className='container' >
                    <h5>{this.__('Data Fields')}</h5>
                    <div className='right'>
                      <button onClick={this.savePresets} className='waves-effect waves-light btn' disabled={!this.state.canSavePresets}>{this.__('Save')}</button>
                    </div>
                    <PresetEditor onValid={this.presetsValid} onInvalid={this.presetsInvalid} />
                    <div className='right'>
                      <button onClick={this.savePresets} className='waves-effect waves-light btn' disabled={!this.state.canSavePresets}>{this.__('Save')}</button>
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
                    submitText={this.__('Save')}
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
                    tooltip={this.__('Replace Layer Data')}
                    color='blue' icon='file_upload' />
                </li>
                <li>
                  <FloatingButton
                    onClick={this.deleteLayer}
                    tooltip={this.__('Delete Layer')}
                    color='red' icon='delete' />
                </li>
              </ul>
            </div>
            <Progress id='saving-layer-admin' title={this.__('Sending')} subTitle='' dismissible={false} show={this.state.saving} />
          </main>
        </div>
      )
    }
  }
}
