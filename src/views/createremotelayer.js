// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import { Row, Button } from 'antd'
import slugify from 'slugify'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import Header from '../components/header'
import TextInput from '../components/forms/textInput'
import SelectGroup from '../components/Groups/SelectGroup'
import Map from '../components/Map'
import MiniLegend from '../components/Map/MiniLegend'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import type {Layer} from '../types/layer'
import request from 'superagent'
import $ from 'jquery'
import {checkClientError} from '../services/client-error-response'

import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {|
  groups: Array<Object>,
  locale: string,
  mapConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
|}

type State = {
  canSubmit: boolean,
  layer?: Layer,
  remote_host?: string,
  group_id?: string,
  complete: boolean
} & LocaleStoreState

export default class CreateRemoteLayer extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    groups: []
  }

  state: State = {
    canSubmit: false,
    complete: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }

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
    addValidationRule('isHttps', (values, value) => {
      if (value) {
        return value.startsWith('https://')
      } else {
        return false
      }
    })

    addValidationRule('validMapHubsLayerPath', (values, value) => {
      if (typeof window !== 'undefined' && value) {
        const pathParts = $('<a>').prop('href', value).prop('pathname').split('/')
        if (pathParts[1] === 'layer' &&
        (pathParts[2] === 'info' || pathParts[2] === 'map') &&
        pathParts[3]) {
          return true
        }
      }
      return false
    })
  }

  componentDidMount () {
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.state.layer && !_this.state.complete) {
        e.preventDefault()
        e.returnValue = ''
      }
    })
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  loadRemoteUrl = (model: Object) => {
    const _this = this
    const remoteLayerUrl = model.remoteLayerUrl
    const group_id = model.group

    const link = $('<a>').prop('href', remoteLayerUrl)

    const remote_host = link.prop('hostname')
    const pathParts = link.prop('pathname').split('/')
    if (pathParts[1] === 'layer' &&
    (pathParts[2] === 'info' || pathParts[2] === 'map') &&
    pathParts[3]) {
      const remote_layer_id = pathParts[3]

      request.get('https://' + remote_host + '/api/layer/metadata/' + remote_layer_id)
        .type('json').accept('json').timeout(1200000)
        .end((err, res) => {
          checkClientError(res, err, () => {}, (cb) => {
            _this.setState({remote_host, group_id, layer: res.body.layer})
            cb()
          })
        })
    }
  }

  saveLayer = () => {
    const _this = this
    const {layer, group_id, remote_host} = this.state
    if (layer) {
      const name = layer.name || {}
      request.post('/api/layer/create/remote')
        .type('json').accept('json')
        .send({
          group_id,
          layer,
          host: remote_host
        })
        .end((err, res) => {
          checkClientError(res, err, () => {}, (cb) => {
            const layer_id = res.body.layer_id
            _this.setState({complete: true})
            window.location = '/layer/info/' + layer_id + '/' + slugify(_this.t(name))
            cb()
          })
        })
    }
  }

  render () {
    const {t} = this
    if (!this.props.groups || this.props.groups.length === 0) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <Row style={{marginBottom: '20px'}}>
                <h5>{t('Please Join a Group')}</h5>
                <p>{t('Please create or join a group before creating a layer.')}</p>
              </Row>
            </div>
          </main>
        </ErrorBoundary>
      )
    }

    let layerReview = ''

    if (this.state.layer) {
      layerReview = (
        <Row style={{marginBottom: '20px'}}>
          <Row style={{marginBottom: '20px'}}>
            <Map
              style={{width: '100%', height: '400px'}}
              id='remote-layer-preview-map'
              showFeatureInfoEditButtons={false}
              mapConfig={this.props.mapConfig}
              glStyle={this.state.layer.style}
              fitBounds={this.state.layer.preview_position.bbox}
              primaryColor={MAPHUBS_CONFIG.primaryColor}
              logoSmall={MAPHUBS_CONFIG.logoSmall}
              logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
              logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
              t={t}
              locale={this.state.locale}
              mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
              earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
            >
              <MiniLegend
                t={this.t}
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  minWidth: '275px',
                  width: '25%',
                  maxWidth: '325px',
                  maxHeight: 'calc(100% - 200px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                collapsible hideInactive={false} showLayersButton={false}
                title={this.state.layer.name}
                layers={[this.state.layer]}
              />
            </Map>
          </Row>
          <Row style={{marginBottom: '20px', textAlign: 'right'}}>
            <Button type='primary' onClick={this.saveLayer}>{t('Save Layer')}</Button>
          </Row>
        </Row>
      )
    }
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...this.props.headerConfig} />
          <main>
            <h4>{t('Link to a Remote Layer')}</h4>
            <div className='container center'>
              <p>{t('Please copy and paste a link to a remote MapHubs layer')}</p>
              <Row>
                <Formsy onValidSubmit={this.loadRemoteUrl} onValid={this.enableButton} onInvalid={this.disableButton}>
                  <TextInput
                    name='remoteLayerUrl' label={t('Remote MapHubs URL')} icon='link' validations='maxLength:250,isHttps,validMapHubsLayerPath' validationErrors={{
                      maxLength: t('Must be 250 characters or less.'),
                      isHttps: t('MapHubs requires encryption for external links, URLs must start with https://'),
                      validMapHubsLayerPath: t('Not a valid MapHubs Layer URL')
                    }} length={250}
                    tooltipPosition='top' tooltip={t('MapHubs Layer URL ex: https://maphubs.com/layer/info/123/my-layer')}
                    required
                  />
                  <SelectGroup groups={this.props.groups} type='layer' />
                  <div style={{float: 'right'}}>
                    <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{t('Load Remote Layer')}</Button>
                  </div>
                </Formsy>
              </Row>
              {layerReview}

            </div>

          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
