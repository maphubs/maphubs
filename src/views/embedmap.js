// @flow
import React from 'react'
import InteractiveMap from '../components/InteractiveMap'
import request from 'superagent'
import _bbox from '@turf/bbox'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import type {Layer} from '../stores/layer-store'
import type {GLStyle} from '../types/mapbox-gl-style'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import {Tooltip} from 'react-tippy'

const urlUtil = require('../services/url-util')
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
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }

    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }

    const glStyle = this.props.map.style
    const layers = this.props.layers
    if (this.props.geoJSONUrl) {
      glStyle.sources['geojson-overlay'] = {
        type: 'geojson',
        data: this.props.geoJSONUrl
      }

      glStyle.layers.push(this.getStyleLayer())
      layers.push(this.getLayerConfig())
    }

    this.state = {
      interactive: this.props.interactive,
      bounds: null,
      layers,
      glStyle
    }
  }

  componentDidMount () {
    if (this.props.geoJSONUrl) {
      this.loadGeoJSON(this.props.geoJSONUrl)
    }
  }

  startInteractive = () => {
    this.setState({interactive: true})
  }

  loadGeoJSON = (url: string) => {
    const _this = this
    request.get(url)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, () => {}, () => {
          const geoJSON = res.body
          const bounds = _bbox(geoJSON)
          // _this.refs.map.fitBounds(bounds, 12, 10, true);
          _this.setState({bounds})
        })
      })
  }

  getStyleLayer = () => {
    return {
      'id': 'omh-data-point-geojson-overlay',
      'type': 'circle',
      'metadata': {
        'maphubs:layer_id': 0,
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false,
        'maphubs:markers': {
          'shape': 'MAP_PIN',
          'size': '32',
          'width': 32,
          'height': 32,
          'shapeFill': this.props.markerColor,
          'shapeFillOpacity': 0.75,
          'shapeStroke': '#FFFFFF',
          'shapeStrokeWidth': 2,
          'inverted': false,
          'enabled': true,
          'dataUrl': this.props.geoJSONUrl,
          'interactive': true
        }
      },
      'source': 'geojson-overlay',
      'filter': [
        'in',
        '$type',
        'Point'
      ],
      'paint': {
        'circle-color': this.props.markerColor
      }
    }
  }

  getLayerConfig = (): Layer => {
    const emptyLocalizedString: LocalizedString = {en: '', fr: '', es: '', it: ''}

    const style: GLStyle = {
      version: 8,
      sources: {
        'geojson-overlay': {
          type: 'geojson',
          data: this.props.geoJSONUrl
        }
      },
      layers: [this.getStyleLayer()]
    }

    return {
      active: true,
      layer_id: -2,
      name: this.props.overlayName,
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
    let map = ''

    let bounds

    if (this.props.isStatic && !this.state.interactive) {
      let imgSrc = this.props.image
      const baseUrl = urlUtil.getBaseUrl()
      if (imgSrc.startsWith(baseUrl)) {
        imgSrc = imgSrc.replace(baseUrl, '')
      }
      imgSrc = '/img/resize/1200?url=' + imgSrc
      map = (
        <div style={{position: 'relative'}}>
          <img src={imgSrc} style={{width: '100%', height: '100%', objectFit: 'contain'}} alt={MAPHUBS_CONFIG.productName + ' Map'} />
          <Tooltip
            title={this.__('Start Interactive Map')}
            position='right' inertia followCursor>
            <a onClick={this.startInteractive} className='embed-map-btn btn-floating waves-effect waves-light'
              style={{position: 'absolute', left: 'calc(50% - 20px)', bottom: '50%', backgroundColor: 'rgba(25,25,25,0.35)', height: '60px', width: '60px', zIndex: '999'}}>
              <i style={{lineHeight: '60px', fontSize: '30px'}} className='material-icons'>play_arrow</i>
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
        <InteractiveMap ref='interactiveMap' height='100vh'
          interactive={this.state.interactive}
          fitBounds={bounds}
          fitBoundsOptions={{animate: false, padding: 0, maxZoom: 20}}
          style={this.state.glStyle}
          layers={this.state.layers}
          map_id={this.props.map.map_id}
          disableScrollZoom
          mapConfig={this.props.mapConfig}
          title={this.props.map.title}
          basemap={this.props.map.basemap}
          insetConfig={insetConfig}
          insetMap={this.props.insetMap}
          showLogo={this.props.showLogo}
          showScale={this.props.showScale}
          preserveDrawingBuffer

          {...this.props.map.settings}
        />
      )
    }
    return (
      <ErrorBoundary>
        <div className='embed-map' style={{height: '100%', width: '100%', display: 'flex', overflow: 'hidden'}}>
          {map}
        </div>
      </ErrorBoundary>
    )
  }
}
