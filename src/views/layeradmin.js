// @flow
import React from 'react'
import Header from '../components/header'
import { message, notification, Modal, Row, Button, Tabs, PageHeader, Divider } from 'antd'
import LayerSettings from '../components/CreateLayer/LayerSettings'
import LayerAdminSettings from '../components/CreateLayer/LayerAdminSettings'
import PresetEditor from '../components/CreateLayer/PresetEditor'
import LayerStyle from '../components/CreateLayer/LayerStyle'
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
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal
const checkClientError = require('../services/client-error-response').checkClientError

const TabPane = Tabs.TabPane

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
  canSavePresets: boolean
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

    const baseMapContainerInit: {
      baseMap?: string,
      bingKey: string,
      tileHostingKey: string,
      mapboxAccessToken: string,
      baseMapOptions?: Object
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()

    LayerActions.loadLayer()
  }

  saveStyle = () => {
    const {t} = this
    LayerActions.saveStyle(this.state, this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'))
      }
    })
  }

  onSave = () => {
    const {t} = this
    message.success(t('Layer Saved'))
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
        notification.error({
          message: t('Data Error'),
          description: t('Duplicate tag, please choose a unique tag for each field'),
          duration: 0
        })
      } else {
        // save presets
        LayerActions.submitPresets(false, this.state._csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
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
    confirm({
      title: t('Confirm Deletion'),
      content: t('Please confirm removal of') + ' ' +
      t(this.props.layer.name) + '. ' +
      t('All additions, modifications, and feature notes will be deleted. This layer will also be removed from all maps, and stories.'),
      okText: t('Delete'),
      okType: 'danger',
      onOk () {
        const closeMessage = message.loading(t('Deleting'), 0)
        LayerActions.deleteLayer(_this.state._csrf, (err) => {
          closeMessage()
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.success(t('Layer Deleted'), 1, () => {
              window.location = '/'
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
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.success(t('Layer Updated'))
          }
          cb()
        })
      })
  }

  render () {
    const {t} = this

    const layerId = this.props.layer.layer_id ? this.props.layer.layer_id : 0
    const layerName = slugify(this.t(this.props.layer.name))
    const layerInfoUrl = `/layer/info/${layerId}/${layerName}`

    if (this.props.layer.remote) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <Row>
                <PageHeader
                  onBack={() => {
                    window.location = layerInfoUrl
                  }}
                  style={{padding: '5px'}}
                  title={t('Back to Layer')}
                />
              </Row>
              <Row style={{textAlign: 'center'}}>
                <h5>{t('Unable to modify remote layers.')}</h5>
                <div className='center-align center'>
                  <Button
                    type='primary' style={{marginTop: '20px'}}
                    onClick={this.refreshRemoteLayer}
                  >{t('Refresh Remote Layer')}
                  </Button>
                </div>
                <p>{t('You can remove this layer using the button in the bottom right.')}</p>
              </Row>
              <Row>
                <Button type='danger' onClick={this.deleteLayer}>{t('Delete Layer')}</Button>
              </Row>
            </div>
          </main>
        </ErrorBoundary>
      )
    } else {
      return (
        <ErrorBoundary>
          <Provider inject={[this.BaseMapState, this.MapState]}>
            <Header {...this.props.headerConfig} />
            <main style={{height: 'calc(100% - 50px)'}}>
              <Row>
                <PageHeader
                  onBack={() => {
                    window.location = layerInfoUrl
                  }}
                  style={{padding: '5px'}}
                  title={t('Back to Layer')}
                />
              </Row>
              <Row style={{height: 'calc(100% - 50px)'}}>
                <style jsx global>{`
                  .ant-tabs-content {
                    height: calc(100% - 44px)
                  }
                  .ant-tabs-tabpane {
                    height: 100%;
                  }

                  .ant-tabs-nav-wrap {
                    padding-left: 10px;
                  }

                  .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
                    display: none;
                  }
                `}
                </style>
                <Tabs
                  defaultActiveKey='settings'
                  style={{height: '100%', width: '100%'}}
                  tabBarStyle={{marginBottom: 0}}
                  animated={false}
                >
                  <TabPane tab={t('Info')} key='settings' style={{position: 'relative'}}>
                    <LayerSettings
                      groups={this.props.groups}
                      showGroup={false}
                      warnIfUnsaved
                      onSubmit={this.onSave}
                      submitText={t('Save')}
                    />
                    <Row style={{marginBottom: '20px'}}><Divider /></Row>
                    <Row style={{marginBottom: '20px', padding: '0px 20px'}}>
                      <h5 style={{fontSize: '18px'}}>{t('Modify Data')}</h5>
                      <Row style={{marginBottom: '20px'}}>
                        <Button type='primary' href={`/layer/replace/${layerId}/${layerName}`}>{t('Replace Layer Data')}</Button>
                      </Row>
                      <Row style={{marginBottom: '20px'}}>
                        <Button type='danger' onClick={this.deleteLayer}>{t('Delete Layer')}</Button>
                      </Row>
                    </Row>
                  </TabPane>
                  <TabPane tab={t('Fields')} key='fields' style={{position: 'relative'}}>
                    <div className='container'>
                      <h5>{t('Data Fields')}</h5>
                      <Row style={{textAlign: 'right'}}>
                        <Button type='primary' onClick={this.savePresets} disabled={!this.state.canSavePresets}>{t('Save')}</Button>
                      </Row>
                      <PresetEditor onValid={this.presetsValid} onInvalid={this.presetsInvalid} />
                      <Row style={{textAlign: 'right'}}>
                        <Button type='primary' onClick={this.savePresets} disabled={!this.state.canSavePresets}>{t('Save')}</Button>
                      </Row>
                    </div>
                  </TabPane>
                  <TabPane tab={t('Style/Display')} key='style' style={{position: 'relative'}}>
                    <LayerStyle
                      showPrev={false}
                      onSubmit={this.onSave}
                      mapConfig={this.props.mapConfig}
                    />
                  </TabPane>
                  {this.state.user && this.state.user.admin &&
                    <TabPane tab={t('Admin Only')} key='admin' style={{position: 'relative'}}>
                      <LayerAdminSettings
                        groups={this.props.groups}
                        warnIfUnsaved
                        onSubmit={this.onSave}
                        submitText={t('Save')}
                      />
                    </TabPane>}
                </Tabs>
              </Row>

            </main>
          </Provider>
        </ErrorBoundary>
      )
    }
  }
}
