import React from 'react'
import MiniLegend from '../src/components/Map/MiniLegend'
import Map from '../src/components/Map'
import { Row, Col, Switch, Modal, message } from 'antd'
import _debounce from 'lodash.debounce'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import fireResizeEvent from '../services/fire-resize-event'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const $ = require('jquery')

const confirm = Modal.confirm
type Props = {
  name: LocalizedString
  layers: Array<Record<string, any>>
  style: Record<string, any>
  position: Record<string, any>
  basemap: string
  showLegend: boolean
  showLogo: boolean
  showScale: boolean
  insetMap: boolean
  locale: string
  _csrf: string
  showToolbar?: boolean
  settings: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  width: number
  height: number
  userShowLegend: boolean
  userShowScale: boolean
  userShowInset: boolean
  showSettings: boolean
} // A reponsive full window map used to render screenshots

export default class StaticMap extends React.Component<Props, State> {
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
        insetMap: boolean
        settings: {}
        showLegend: boolean
        showLogo: boolean
        showScale: boolean
      } = {
    showLegend: true,
    showLogo: true,
    showScale: true,
    insetMap: true,
    settings: {}
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
      baseMap: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      baseMap: props.basemap,
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.state = {
      userShowInset: props.insetMap,
      userShowLegend: props.showLegend,
      userShowScale: props.showScale,
      showSettings: !!props.showToolbar,
      width: 1024,
      height: 600
    }
  }

  componentDidMount() {
    const _this = this

    function getSize() {
      return {
        width: Math.floor($(window).width()),
        height: $(window).height()
      }
    }

    this.setState(getSize())
    $(window).resize(function () {
      const debounced = _debounce(() => {
        _this.setState(getSize())
      }, 2500)

      debounced()
    })
    window.addEventListener('keydown', (e) => {
      if (e.key === 'S') {
        this.showSettings()
      }
    })
  }

  setShowInset: any | ((userShowInset: boolean) => void) = (
    userShowInset: boolean
  ) => {
    this.setState({
      userShowInset
    })
  }
  setShowScale: any | ((userShowScale: boolean) => void) = (
    userShowScale: boolean
  ) => {
    this.setState({
      userShowScale
    })
  }
  setShowLegend: any | ((userShowLegend: boolean) => void) = (
    userShowLegend: boolean
  ) => {
    const _this = this

    const { t } = this

    if (!userShowLegend) {
      confirm({
        title: t('Attribution Required'),
        content: t(
          'If you remove the legend you must include the attribution "OpenStreetMap contributors" for the base map, as well as attributions for any data layers in your map. I agree to attribute the data when I share or publish this map.'
        ),
        okText: t('I agree'),

        onOk() {
          _this.setState({
            userShowLegend
          })
        },

        onCancel() {}
      })
    } else {
      _this.setState({
        userShowLegend
      })
    }
  }
  hideSettings: any | (() => void) = () => {
    const { t } = this
    this.setState({
      showSettings: false
    })
    fireResizeEvent()
    message
      .info(t('press the "s" key to reopen settings'), 3)
      .then(() => fireResizeEvent())
  }
  showSettings: any | (() => void) = () => {
    if (!this.state.showSettings) {
      this.setState({
        showSettings: true
      })
      fireResizeEvent()
    }
  }

  render(): JSX.Element {
    let legend, bottomLegend
    const { t, setShowLegend, setShowScale, setShowInset, hideSettings } = this
    const { name, layers, position, settings } = this.props
    const { userShowInset, userShowLegend, userShowScale, showSettings } =
      this.state

    if (userShowLegend) {
      if (this.state.width < 600) {
        bottomLegend = (
          <MiniLegend
            t={t}
            style={{
              width: '100%'
            }}
            collapsible={false}
            title={name}
            hideInactive={false}
            showLayersButton={false}
            layers={layers}
          />
        )
      } else {
        legend = (
          <MiniLegend
            t={t}
            style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              width: '25%'
            }}
            collapsible={false}
            title={name}
            hideInactive
            showLayersButton={false}
            layers={layers}
          />
        )
      }
    }

    let bounds

    if (typeof window === 'undefined' || !window.location.hash) {
      // only update position if there isn't absolute hash in the URL
      if (position && position.bbox) {
        const bbox = position.bbox
        bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
      }
    }

    let insetConfig = {}

    if (settings && settings.insetConfig) {
      insetConfig = settings.insetConfig
    }

    insetConfig.collapsible = false
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <style jsx global>
            {`
              .map-position {
                display: none;
              }
              .maphubs-ctrl-scale {
                display: ${userShowScale ? 'inherit' : 'none'};
              }
              .maphubs-inset {
                display: ${userShowInset ? 'inherit' : 'none'};
              }
              .mapboxgl-ctrl-logo {
                display: ${!this.props.showLogo ? 'none !important' : 'block'};
              }
            `}
          </style>
          {showSettings && (
            <Row
              style={{
                height: '25px',
                paddingLeft: '20px',
                paddingRight: '20px'
              }}
            >
              <Col span={4}>
                <span
                  style={{
                    marginRight: '10px'
                  }}
                >
                  {t('Legend')}
                </span>
                <Switch
                  defaultChecked={userShowLegend}
                  onChange={setShowLegend}
                  size='small'
                />
              </Col>
              <Col span={4}>
                <span
                  style={{
                    marginRight: '10px'
                  }}
                >
                  {t('Scale Bar')}
                </span>
                <Switch
                  defaultChecked={userShowScale}
                  onChange={setShowScale}
                  size='small'
                />
              </Col>
              <Col span={4}>
                <span
                  style={{
                    marginRight: '10px'
                  }}
                >
                  {t('Inset')}
                </span>
                <Switch
                  defaultChecked={userShowInset}
                  onChange={setShowInset}
                  size='small'
                />
              </Col>
              <a
                onClick={hideSettings}
                style={{
                  color: '#323333',
                  textDecoration: 'underline',
                  position: 'absolute',
                  right: '10px'
                }}
              >
                {t('hide')}
              </a>
            </Row>
          )}
          <Row>
            <div className='embed-map'>
              <Map
                id='static-map'
                interactive={false}
                showPlayButton={false}
                fitBounds={bounds}
                insetMap={this.props.insetMap}
                insetConfig={insetConfig}
                showLogo={this.props.showLogo}
                showScale={this.props.showScale}
                style={{
                  width: '100vw',
                  height: showSettings ? 'calc(100vh - 25px)' : '100vh'
                }}
                glStyle={this.props.style}
                mapConfig={this.props.mapConfig}
                preserveDrawingBuffer
                navPosition='top-right'
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
                t={this.t}
              >
                {legend}
              </Map>
              {bottomLegend}
            </div>
          </Row>
        </Provider>
      </ErrorBoundary>
    )
  }
}
