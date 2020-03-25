// @flow
import React from 'react'
import InteractiveMap from '../components/Map/InteractiveMap'
import request from 'superagent'
import _bbox from '@turf/bbox'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import type {Layer} from '../types/layer'
import type {GLStyle} from '../types/mapbox-gl-style'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import {Tooltip} from 'antd'
import StyleHelper from '../components/Map/Styles/style'
import getConfig from 'next/config'
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  map: Object,
  layers: Array<Layer>,
  isStatic: boolean,
  interactive: boolean,
  locale: string,
  geoJSONUrl: string,
  markerColor: string,
  overlayName: LocalizedString,
  mapConfig: Object,
  showLogo: boolean,
  showScale: boolean,
  insetMap: boolean,
  image: string,
  _csrf: string,
  user: Object
}

type State = {
  interactive: boolean,
  bounds: ?Object,
  glStyle: Object,
  layers: Array<Layer>
}

export default class EmbedMap extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    isStatic: false,
    interactive: false,
    markerColor: '#FF0000',
    overlayName: 'Locations',
    showLogo: true,
    showScale: true,
    insetMap: true
  }

  state: State

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})

    const baseMapContainerInit: {
      baseMap: string,
      bingKey: string,
      tileHostingKey: string,
      mapboxAccessToken: string,
      baseMapOptions?: Object
    } = {
      baseMap: props.map.basemap,
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()

    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }

    const glStyle = props.map.style
    const layers = props.layers

    this.state = {
      interactive: props.interactive,
      bounds: null,
      layers,
      glStyle: !props.geoJSONUrl ? glStyle : undefined
    }
  }

  geoJSONLoaded: boolean

  componentDidMount () {
    if (this.props.geoJSONUrl && !this.geoJSONLoaded) {
      this.loadGeoJSON(this.props.geoJSONUrl)
    }
  }

  startInteractive = () => {
    this.setState({interactive: true})
  }

  loadGeoJSON = (url: string) => {
    const _this = this
    const {layers} = this.state

    request.get(url)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, () => {}, () => {
          const geoJSON = res.body
          const bounds = _bbox(geoJSON)
          // _this.refs.map.fitBounds(bounds, 12, 10, true);
          const layer = this.getLayerConfig(this.props, geoJSON)
          const newLayers = [layer].concat(layers)
          const glStyle = StyleHelper.buildMapStyle(layers)
          this.geoJSONLoaded = true
          _this.setState({bounds, glStyle, layers: newLayers})
          this.MapState.state.map.fitBounds(bounds, 12, 50, false)
        })
      })
  }

  getStyleLayers = (props: Props) => {
    return [
      {
        id: 'omh-data-point-geojson-overlay-markers',
        type: 'symbol',
        metadata: {
          'maphubs:interactive': true
        },
        source: 'geojson-overlay',
        layout: {
          'icon-image': 'marker-icon-geojson-overlay',
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'icon-offset': [
            0,
            -16
          ],
          visibility: 'visible'
        }
      },
      {
        id: 'omh-data-point-geojson-overlay',
        type: 'circle',
        metadata: {
          'maphubs:layer_id': 0,
          'maphubs:interactive': true,
          'maphubs:showBehindBaseMapLabels': false,
          'maphubs:markers': {
            shape: 'MAP_PIN',
            size: '32',
            width: 32,
            height: 32,
            shapeFill: props.markerColor,
            shapeFillOpacity: 0.75,
            shapeStroke: '#FFFFFF',
            shapeStrokeWidth: 2,
            inverted: false,
            enabled: true,
            interactive: true,
            version: 2,
            imageName: 'marker-icon-geojson-overlay'
          }
        },
        source: 'geojson-overlay',
        filter: [
          'in',
          '$type',
          'Point'
        ],
        paint: {
          'circle-color': 'rgba(255,255,255,0)',
          'circle-radius': 0
        },
        layout: {
          visibility: 'none'
        }
      }
    ]
  }

  getLayerConfig = (props: Props, geoJSON: Object): Layer => {
    const emptyLocalizedString: LocalizedString = {en: '', fr: '', es: '', it: '', id: '', pt: ''}
    /*
    geoJSON.metadata = {
      'maphubs:presets': []
    }
    */
    const style: GLStyle = {
      version: 8,
      sources: {
        'geojson-overlay': {
          type: 'geojson',
          data: props.geoJSONUrl
        }
      },
      layers: this.getStyleLayers(props)
    }

    return {
      active: true,
      layer_id: -2,
      name: props.overlayName,
      source: emptyLocalizedString,
      description: emptyLocalizedString,
      owned_by_group_id: '',
      remote: true,
      is_external: true,
      external_layer_config: {},
      style,
      legend_html: `
        
        `
    }
  }

  render () {
    const {t} = this
    let map = ''

    let bounds

    if (this.props.isStatic && !this.state.interactive) {
      let imgSrc = this.props.image
      const baseUrl = urlUtil.getBaseUrl()
      if (imgSrc.startsWith(baseUrl)) {
        imgSrc = imgSrc.replace(baseUrl, '')
      }
      imgSrc = '/img/resize/1200?format=webp&quality=80&progressive=true&url=' + imgSrc
      map = (
        <div style={{position: 'relative'}}>
          <img src={imgSrc} style={{width: '100%', height: '100%', objectFit: 'contain'}} alt={MAPHUBS_CONFIG.productName + ' Map'} />
          <Tooltip
            title={t('Start Interactive Map')}
            placement='right'
          >
            <a
              onClick={this.startInteractive} className='embed-map-btn'
              style={{position: 'absolute', left: 'calc(50% - 30px)', bottom: 'calc(50% - 30px)', backgroundColor: 'rgba(25,25,25,0.35)', height: '60px', width: '60px', zIndex: '999'}}
            >
              <PlayCircleFilledWhiteIcon style={{lineHeight: '60px', fontSize: '30px'}} />
            </a>
          </Tooltip>
        </div>
      )
    } else {
      if (!this.state.bounds) {
        if (typeof window === 'undefined' || !window.location.hash) {
          // only update position if there isn't absolute hash in the URL
          if (this.props.map.position && this.props.map.position.bbox) {
            const bbox = this.props.map.position.bbox
            bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
          }
        }
      } else {
        bounds = this.state.bounds
      }

      let insetConfig = {}
      if (this.props.map.settings && this.props.map.settings.insetConfig) {
        insetConfig = this.props.map.settings.insetConfig
      }
      insetConfig.collapsible = false

      map = (
        <InteractiveMap
          height='100vh'
          interactive={this.state.interactive}
          fitBounds={bounds}
          fitBoundsOptions={{animate: false, padding: 0, maxZoom: 20}}
          style={this.state.glStyle}
          layers={this.state.layers}
          map_id={this.props.map.map_id}
          disableScrollZoom
          mapConfig={this.props.mapConfig}
          title={this.props.map.title}
          insetConfig={insetConfig}
          insetMap={this.props.insetMap}
          showLogo={this.props.showLogo}
          showScale={this.props.showScale}
          preserveDrawingBuffer
          primaryColor={MAPHUBS_CONFIG.primaryColor}
          logoSmall={MAPHUBS_CONFIG.logoSmall}
          logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
          logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
          t={this.t}
          mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
          DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
          earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
          onLoad={() => {
            if (this.props.geoJSONUrl && !this.geoJSONLoaded) {
              this.loadGeoJSON(this.props.geoJSONUrl)
            }
          }}
          {...this.props.map.settings}
        />
      )
    }
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState]}>
          <div className='embed-map' style={{height: '100%', width: '100%', display: 'flex', overflow: 'hidden'}}>
            {map}
          </div>
        </Provider>
      </ErrorBoundary>
    )
  }
}
