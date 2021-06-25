import React from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Button, Typography } from 'antd'
import slugify from 'slugify'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import Header from '../components/header'
import TextInput from '../components/forms/textInput'
import SelectGroup from '../components/Groups/SelectGroup'
import Map from '../components/Map'
import MiniLegend from '../components/Map/MiniLegend'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type { LocaleStoreState } from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import type { Layer } from '../types/layer'
import request from 'superagent'
import $ from 'jquery'
import { checkClientError } from '../services/client-error-response'
import LinkIcon from '@material-ui/icons/Link'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography
type Props = {
  groups: Array<Record<string, any>>
  locale: string
  mapConfig: Record<string, any>
  headerConfig: Record<string, any>
  _csrf: string
  user: Record<string, any>
}
type State = {
  canSubmit: boolean
  layer?: Layer
  remote_host?: string
  group_id?: string
  complete: boolean
} & LocaleStoreState
export default class CreateRemoteLayer extends React.Component<Props, State> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps:
    | any
    | {
        groups: Array<any>
      } = {
    groups: []
  }
  state: State = {
    canSubmit: false,
    complete: false
  }

  constructor(props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }

    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
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
        const pathParts = $('<a>')
          .prop('href', value)
          .prop('pathname')
          .split('/')

        if (
          pathParts[1] === 'layer' &&
          (pathParts[2] === 'info' || pathParts[2] === 'map') &&
          pathParts[3]
        ) {
          return true
        }
      }

      return false
    })
  }

  unloadHandler: any

  componentDidMount() {
    const _this = this

    this.unloadHandler = (e) => {
      if (_this.state.layer && !_this.state.complete) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  enableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
  }
  loadRemoteUrl: any | ((model: any) => void) = (
    model: Record<string, any>
  ) => {
    const _this = this

    const remoteLayerUrl = model.remoteLayerUrl
    const group_id = model.group
    const link = $('<a>').prop('href', remoteLayerUrl)
    const remote_host = link.prop('hostname')
    const pathParts = link.prop('pathname').split('/')

    if (
      pathParts[1] === 'layer' &&
      (pathParts[2] === 'info' || pathParts[2] === 'map') &&
      pathParts[3]
    ) {
      const remote_layer_id = pathParts[3]
      request
        .get(
          'https://' + remote_host + '/api/layer/metadata/' + remote_layer_id
        )
        .type('json')
        .accept('json')
        .timeout(1200000)
        .end((err, res) => {
          checkClientError(
            res,
            err,
            () => {},
            (cb) => {
              _this.setState({
                remote_host,
                group_id,
                layer: res.body.layer
              })

              cb()
            }
          )
        })
    }
  }
  saveLayer: any | (() => void) = () => {
    const _this = this

    const { layer, group_id, remote_host } = this.state

    if (layer) {
      const name = layer.name || {}
      request
        .post('/api/layer/create/remote')
        .type('json')
        .accept('json')
        .send({
          group_id,
          layer,
          host: remote_host
        })
        .end((err, res) => {
          checkClientError(
            res,
            err,
            () => {},
            (cb) => {
              const layer_id = res.body.layer_id

              _this.setState({
                complete: true
              })

              window.location =
                '/layer/info/' + layer_id + '/' + slugify(_this.t(name))
              cb()
            }
          )
        })
    }
  }

  render(): JSX.Element {
    const { t } = this
    const { groups } = this.props
    const { layer } = this.state

    if (!groups || groups.length === 0) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <h5>{t('Please Join a Group')}</h5>
                <p>
                  {t('Please create or join a group before creating a layer.')}
                </p>
              </Row>
            </div>
          </main>
        </ErrorBoundary>
      )
    }

    let layerReview = ''

    if (layer) {
      layerReview = (
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Map
              style={{
                width: '100%',
                height: '400px'
              }}
              id='remote-layer-preview-map'
              showFeatureInfoEditButtons={false}
              mapConfig={this.props.mapConfig}
              glStyle={layer.style}
              fitBounds={layer.preview_position?.bbox}
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
                t={t}
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
                collapsible
                hideInactive={false}
                showLayersButton={false}
                title={layer.name}
                layers={[layer]}
              />
            </Map>
          </Row>
          <Row
            justify='end'
            style={{
              textAlign: 'right'
            }}
          >
            <Button type='primary' onClick={this.saveLayer}>
              {t('Save Layer')}
            </Button>
          </Row>
        </Row>
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <Header {...this.props.headerConfig} />
          <main className='container'>
            <Row justify='center'>
              <Title>{t('Link to a Remote Layer')}</Title>
            </Row>
            <Row justify='center'>
              <p>
                {t('Please copy and paste a link to a remote MapHubs layer')}
              </p>
            </Row>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Formsy
                onValidSubmit={this.loadRemoteUrl}
                onValid={this.enableButton}
                onInvalid={this.disableButton}
                style={{
                  width: '100%'
                }}
              >
                <TextInput
                  name='remoteLayerUrl'
                  label={t('Remote MapHubs URL')}
                  icon={<LinkIcon />}
                  validations='maxLength:250,isHttps,validMapHubsLayerPath'
                  validationErrors={{
                    maxLength: t('Must be 250 characters or less.'),
                    isHttps: t(
                      'MapHubs requires encryption for external links, URLs must start with https://'
                    ),
                    validMapHubsLayerPath: t('Not a valid MapHubs Layer URL')
                  }}
                  length={250}
                  tooltipPosition='top'
                  tooltip={t(
                    'MapHubs Layer URL ex: https://maphubs.com/layer/info/123/my-layer'
                  )}
                  required
                  t={t}
                />
                <SelectGroup groups={groups} type='layer' />
                <div
                  style={{
                    float: 'right'
                  }}
                >
                  <Button
                    type='primary'
                    htmlType='submit'
                    disabled={!this.state.canSubmit}
                  >
                    {t('Load Remote Layer')}
                  </Button>
                </div>
              </Formsy>
            </Row>
            <Row>{layerReview}</Row>
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
