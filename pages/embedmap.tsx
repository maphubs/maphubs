import React from 'react'
import InteractiveMap from '../src/components/Map/InteractiveMap'
import request from 'superagent'
import _bbox from '@turf/bbox'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import MapContainer from '../src/components/Map/containers/MapContainer'
import type { Layer } from '../src/types/layer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { Tooltip } from 'antd'
import StyleHelper from '../src/components/Map/Styles/style'
import getConfig from 'next/config'
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite'
import { LocalizedString } from '../src/types/LocalizedString'
import mapboxgl from 'mapbox-gl'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { checkClientError } from '../src/services/client-error-response'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  map: Record<string, any>
  layers: Layer[]
  isStatic: boolean
  interactive: boolean
  locale: string
  geoJSONUrl: string
  markerColor: string
  overlayName: LocalizedString
  mapConfig: Record<string, any>
  showLogo: boolean
  showScale: boolean
  insetMap: boolean
  image: string
  _csrf: string
  user: Record<string, any>
}
type State = {
  interactive: boolean
  bounds: Record<string, any> | null | undefined
  glStyle: mapboxgl.Style
  layers: Array<Layer>
}
export default class EmbedMap extends React.Component<Props, State> {
  BaseMapState: Container<any>
  MapState: Container<any>
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
        interactive: boolean
        isStatic: boolean
        markerColor: string
        overlayName: string
        showLogo: boolean
        showScale: boolean
      } = {
    isStatic: false,
    interactive: false,
    markerColor: '#FF0000',
    overlayName: 'Locations',
    showLogo: true,
    showScale: true,
    insetMap: true
  }
  state: State

  constructor(props: Props) {
    super(props)
    const baseMapContainerInit: {
      baseMap: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
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

  componentDidMount(): void {
    if (this.props.geoJSONUrl && !this.geoJSONLoaded) {
      this.loadGeoJSON(this.props.geoJSONUrl)
    }
  }

  startInteractive = (): void => {
    this.setState({
      interactive: true
    })
  }
  loadGeoJSON = (url: string): void => {
    const { setState, MapState, state, props } = this
    const { layers } = state
    request
      .get(url)
      .type('json')
      .accept('json')
      .end((err, res) => {
        checkClientError(
          res,
          err,
          () => {},
          () => {
            const geoJSON = res.body

            const bounds = _bbox(geoJSON)

            // _this.refs.map.fitBounds(bounds, 12, 10, true);
            const layer = this.getLayerConfig(props, geoJSON)
            const newLayers = [layer, ...layers]
            const glStyle = StyleHelper.buildMapStyle(layers)
            this.geoJSONLoaded = true

            setState({
              bounds,
              glStyle,
              layers: newLayers
            })

            MapState.state.map.fitBounds(bounds, 12, 50, false)
          }
        )
      })
  }
  getStyleLayers:
    | any
    | ((props: Props) => Array<{
        filter?: mapboxgl.Layer['filter']
        id: string
        layout?: mapboxgl.Layout
        maxzoom?: number
        metadata?: any
        minzoom?: number
        paint?: mapboxgl.AnyPaint
        ref?: string
        source?: string
        type:
          | 'fill'
          | 'line'
          | 'symbol'
          | 'circle'
          | 'fill-extrusion'
          | 'raster'
          | 'background'
      }>) = (props: Props) => {
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
          'icon-offset': [0, -16],
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
        filter: ['in', '$type', 'Point'],
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
  getLayerConfig: any | ((props: Props, geoJSON: any) => Layer) = (
    props: Props,
    geoJSON: Record<string, any>
  ): Layer => {
    const emptyLocalizedString: LocalizedString = {
      en: '',
      fr: '',
      es: '',
      it: '',
      id: '',
      pt: ''
    }

    /*
    geoJSON.metadata = {
      'maphubs:presets': []
    }
    */
    const style: mapboxgl.Style = {
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

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      startInteractive,
      geoJSONLoaded,
      BaseMapState,
      MapState
    } = this
    const {
      isStatic,
      image,
      map,
      geoJSONUrl,
      mapConfig,
      insetMap,
      showLogo,
      showScale
    } = props
    const { interactive, glStyle, layers, bounds } = state
    let mapComponent
    let boundsCleaned

    if (isStatic && !interactive) {
      let imgSrc = image
      const baseUrl = urlUtil.getBaseUrl()

      if (imgSrc.startsWith(baseUrl)) {
        imgSrc = imgSrc.replace(baseUrl, '')
      }

      mapComponent = (
        <div
          style={{
            position: 'relative'
          }}
        >
          <img
            src={imgSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            alt={MAPHUBS_CONFIG.productName + ' Map'}
          />
          <Tooltip title={t('Start Interactive Map')} placement='right'>
            <a
              onClick={startInteractive}
              className='embed-map-btn'
              style={{
                position: 'absolute',
                left: 'calc(50% - 30px)',
                bottom: 'calc(50% - 30px)',
                zIndex: 999
              }}
            >
              <PlayCircleFilledWhiteIcon
                style={{
                  lineHeight: '60px',
                  fontSize: '60px',
                  color: 'rgba(25,25,25,0.35)'
                }}
              />
            </a>
          </Tooltip>
        </div>
      )
    } else {
      if (!bounds) {
        if (
          (typeof window === 'undefined' || !window.location.hash) && // only update position if there isn't absolute hash in the URL
          map.position &&
          map.position.bbox
        ) {
          const bbox = map.position.bbox
          boundsCleaned = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
        }
      } else {
        boundsCleaned = bounds
      }

      let insetConfig = {}

      if (map.settings && map.settings.insetConfig) {
        insetConfig = map.settings.insetConfig
      }

      insetConfig.collapsible = false
      mapComponent = (
        <InteractiveMap
          height='100vh'
          interactive={interactive}
          fitBounds={boundsCleaned}
          fitBoundsOptions={{
            animate: false,
            padding: 0,
            maxZoom: 20
          }}
          style={glStyle}
          layers={layers}
          map_id={map.map_id}
          disableScrollZoom
          mapConfig={mapConfig}
          title={map.title}
          insetConfig={insetConfig}
          insetMap={insetMap}
          showLogo={showLogo}
          showScale={showScale}
          preserveDrawingBuffer
          primaryColor={MAPHUBS_CONFIG.primaryColor}
          logoSmall={MAPHUBS_CONFIG.logoSmall}
          logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
          logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
          t={t}
          mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
          DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
          earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
          onLoad={() => {
            if (geoJSONUrl && !geoJSONLoaded) {
              this.loadGeoJSON(geoJSONUrl)
            }
          }}
          {...map.settings}
        />
      )
    }

    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState, MapState]}>
          <div
            className='embed-map'
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              overflow: 'hidden'
            }}
          >
            {mapComponent}
          </div>
        </Provider>
      </ErrorBoundary>
    )
  }
}
