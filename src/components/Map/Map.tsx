/**
 * Note: SSR not supported, needs to be loaded dynamically in NextJS
 */
import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import FeaturePopup from './FeaturePopup'
import BaseMapContainer from './containers/BaseMapContainer'
import DataEditorContainer from './containers/DataEditorContainer'
import MapContainer from './containers/MapContainer'
import { subscribe } from './containers/unstated-props'
import _isequal from 'lodash.isequal'
import MapToolButton from './MapToolButton'
import MapSearchPanel from './Search/MapSearchPanel'
import MapToolPanel from './MapToolPanel'
import InsetMap from './InsetMap'
import MapboxGLHelperMixin from './Helpers/MapboxGLHelperMixin'
import MapInteractionMixin from './Helpers/MapInteractionMixin'
import MeasurementToolMixin from './Helpers/MeasurementToolMixin'
import MapGeoJSONMixin from './Helpers/MapGeoJSONMixin'
import DataEditorMixin from './Helpers/DataEditorMixin'
import IsochroneMixin from './Helpers/IsochroneMixin'
import StyleMixin from './Helpers/StyleMixin'
import MapSearchMixin from './Search/MapSearchMixin'
import turfCentroid from '@turf/centroid'
import PlayArrow from '@material-ui/icons/PlayArrow'
import MapLayerMenu from './MapLayerMenu'
import { Layer } from '../../types/layer'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import $ from 'jquery'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Feature, FeatureCollection } from 'geojson'
import mapboxgl from 'mapbox-gl'
import ScalePositionControl from 'mapbox-gl-dual-scale-control'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import lunr from 'lunr'
import { LocalizedString } from '../../types/LocalizedString'

const debug = DebugService('map')
type Props = {
  className: string
  id: string
  maxBounds?: Record<string, any>
  maxZoom?: number
  minZoom?: number
  zoom?: number
  height: string
  style: Record<string, any>
  glStyle?: mapboxgl.Style
  features?: Array<Record<string, any>>
  tileJSONType?: string
  tileJSONUrl?: string
  data?: FeatureCollection
  interactive: boolean
  showPlayButton: boolean
  showLogo: boolean
  showScale: boolean
  showFeatureInfoEditButtons: boolean
  fitBounds?: Array<Array<number>>
  fitBoundsOptions: Record<string, any>
  disableScrollZoom?: boolean
  enableRotation?: boolean
  navPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  onChangeBaseMap?: (...args: Array<any>) => any
  insetMap: boolean
  hoverInteraction: boolean
  interactionBufferSize: number
  hash: boolean
  gpxLink?: string
  attributionControl: boolean
  allowLayerOrderOptimization: boolean
  preserveDrawingBuffer?: boolean
  mapConfig: Record<string, any>
  insetConfig: Record<string, any>
  onToggleForestLoss?: (...args: Array<any>) => void
  onToggleIsochroneLayer?: (...args: Array<any>) => void
  children?: JSX.Element | JSX.Element[]
  containers: {
    baseMapState: Record<string, any>
    dataEditorState: Record<string, any>
    mapState: Record<string, any>
  }
  onLoad: (...args: Array<any>) => void
  t: (v: string | LocalizedString) => string
  locale: string
  logoSmall?: string
  logoSmallWidth?: number
  logoSmallHeight?: number
  mapboxAccessToken: string
  DGWMSConnectID?: string
  earthEngineClientID?: string
  categories?: Array<Record<string, any>>
  mapLayers?: Layer[]
  toggleVisibility?: (...args: Array<any>) => void
  showMapTools: boolean
  showSearch: boolean
  showFullScreen: boolean
}
type State = {
  id: string
  selectedFeature?: Feature
  selected: boolean
  interactive: boolean
  interactiveLayers: Array<Record<string, any>>
  mapLoaded: boolean
  allowLayersToMoveMap: boolean
  measurementMessage?: string
  enableMeasurementTools?: boolean
  isochroneResult?: Record<string, any>
}

class Map extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
    interactive: true,
    showFeatureInfoEditButtons: true,
    showMapTools: true,
    showSearch: true,
    showPlayButton: true,
    navPosition: 'top-right' as Props['navPosition'],
    showLogo: true,
    insetMap: true,
    showScale: true,
    showFullScreen: true,
    hoverInteraction: false,
    interactionBufferSize: 10,
    hash: true,
    attributionControl: false,
    preserveDrawingBuffer: false,
    style: {},
    allowLayerOrderOptimization: true,
    fitBoundsOptions: {
      animate: false
    },
    height: '100%',
    mapConfig: {},
    insetConfig: {}
  }
  map: mapboxgl.Map
  overlayMapStyle: mapboxgl.Style
  mapboxPopup: mapboxgl.Popup
  glStyle: mapboxgl.Style
  idx: any
  searchSourceIds: any
  languageControl: any
  lunr: any

  constructor(props: Props) {
    super(props)
    this.state = {
      id: props.id ? props.id : 'map',
      selected: false,
      interactive: props.interactive,
      mapLoaded: false,
      allowLayersToMoveMap: !props.fitBounds,
      interactiveLayers: []
    }
  }

  componentDidMount() {
    const { mapState } = this.props.containers
    mapState.setMap(this)

    if (this.props.glStyle) {
      const interactiveLayers = this.getInteractiveLayers(this.props.glStyle)
      this.setState({
        interactiveLayers
      })
    }

    this.createMap()
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { props, state, map } = this
    const { id, interactive } = state
    const { navPosition, showFullScreen, locale, containers } = props
    // switch to interactive
    if (interactive && !prevState.interactive) {
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false
        }),
        navPosition
      )
      if (showFullScreen)
        map.addControl(
          new mapboxgl.FullscreenControl({
            container: document.querySelector(`#${id}-fullscreen-wrapper`)
          }),
          navPosition
        )
      if (map.dragPan) map.dragPan.enable()
      if (map.scrollZoom) map.scrollZoom.enable()
      if (map.doubleClickZoom) map.doubleClickZoom.enable()
      if (map.touchZoomRotate) map.touchZoomRotate.enable()
    }

    // change locale
    if (locale && locale !== prevProps.locale) {
      this.changeLocale(locale, map)
      const { mapState } = containers

      if (mapState.state.insetMap) {
        this.changeLocale(locale, mapState.state.insetMap.getInsetMap())
      }
    }
  }

  debugLog = (msg: string) => {
    debug.log(`(${this.state.id}) ${msg}`)
  }
  addMapData = (
    map: any,
    glStyle?: mapboxgl.Style,
    geoJSON?: FeatureCollection,
    cb: (...args: Array<any>) => any
  ) => {
    this.debugLog('addMapData')

    const { props, debugLog, overlayMapStyle, setOverlayStyle, initGeoJSON } =
      this
    const { allowLayerOrderOptimization } = props

    const style = overlayMapStyle || glStyle

    if (style && style.sources) {
      return Promise.resolve(
        setOverlayStyle(style, allowLayerOrderOptimization)
      )
        .catch((err) => {
          console.error('error adding map data')
          console.error(err)
          debugLog(err)
        })
        .asCallback((err) => {
          if (err) {
            console.error('error adding map data')
            console.error(err)
            this.debugLog(err)
          }

          if (geoJSON) {
            initGeoJSON(geoJSON)
          }

          cb()
        })
    } else if (geoJSON) {
      initGeoJSON(geoJSON)

      cb()
    } else {
      cb()
    }
  }
  createMap = async () => {
    this.debugLog('Creating MapboxGL Map')
    mapboxgl.accessToken = this.props.mapboxAccessToken
    const {
      debugLog,
      props,
      state,
      glStyle,
      addMapData,
      setState,
      mousemoveHandler,
      moveendHandler,
      clickHandler
    } = this
    const {
      preserveDrawingBuffer,
      enableRotation,
      hash,
      fitBounds,
      fitBoundsOptions,
      data,
      attributionControl,
      zoom,
      minZoom,
      maxZoom,
      t,
      locale,
      showFullScreen,
      disableScrollZoom,
      showScale,
      containers,
      onLoad,
      navPosition
    } = props
    const { id, interactive, mapLoaded } = state
    const { baseMapState, mapState } = containers
    await baseMapState.initBaseMap()
    const baseMapStyle = baseMapState.state.baseMapStyle
    this.setBaseMapStyle(baseMapStyle, false)

    if (!mapboxgl || !mapboxgl.supported || !mapboxgl.supported()) {
      alert(
        t(
          'Your browser does not support Mapbox GL please see: https://help.maphubs.com/getting-started/troubleshooting-common-issues'
        )
      )
      return
    }

    const map = new mapboxgl.Map({
      container: id,
      style: glStyle,
      zoom: zoom || 0,
      minZoom: minZoom || 0,
      maxZoom: maxZoom || 22,
      interactive,
      dragRotate: !!enableRotation,
      touchZoomRotate: true,
      touchPitch: false,
      preserveDrawingBuffer,
      center: [0, 0],
      hash,
      attributionControl: false,
      transformRequest: (url: string, resourceType) => {
        if (map.authUrlStartsWith && url.startsWith(map.authUrlStartsWith)) {
          // TODO: //add CSRF support for vector tiles
          return {
            url: url,
            headers: {
              Authorization: 'Basic ' + map.authToken
            },
            credentials: 'include'
          }
        }
      }
    })
    // catch generic errors so 404 tile errors etc don't cause unexpected issues
    map.on('error', (err) => {
      console.log(err.error)
      debug.error(err.error)
    })
    map.on('load', () => {
      debugLog('MAP LOADED')
      // add selector for screenshot tool
      setTimeout(() => {
        $('body').append(
          '<div id="map-load-complete" style="display: none;"></div>'
        )
      }, 5000)
    })
    map.on('style.load', () => {
      debugLog('style.load')

      // restore map bounds (except for geoJSON maps)
      if (
        !data && // use bbox for GeoJSON data
        !mapLoaded && // only set map position on first style load (not after changing base map etc)
        fitBounds // bounds are provided in Props
      ) {
        let bounds = fitBounds

        if (bounds.length > 2) {
          bounds = [
            [fitBounds[0], fitBounds[1]],
            [fitBounds[2], fitBounds[3]]
          ]
        }

        debugLog(`fitting map to bounds: ${bounds.toString()}`)
        map.fitBounds(fitBounds, fitBoundsOptions)

        if (mapState.state.insetMap) {
          mapState.state.insetMap.sync(map)
        } else {
          debugLog('insetMap not found')
        }
      }

      // add the omh data
      addMapData(map, glStyle, data, () => {
        // do stuff that needs to happen after data loads
        debugLog('finished adding map data')

        setState({
          mapLoaded: true
        })

        if (onLoad) onLoad()
      })
    })

    // end style.load
    // Setup inset map
    if (mapState.state.insetMap) {
      if (!mapState.state.insetMap.getInsetMap()) {
        mapState.initInset(map, baseMapStyle)
      }
    } else {
      debugLog('failed to init inset')
    }

    map.on('mousemove', mousemoveHandler)
    map.on('moveend', moveendHandler)
    map.on('click', clickHandler)

    if (interactive) {
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false
        }),
        navPosition
      )
      if (showFullScreen)
        map.addControl(
          new mapboxgl.FullscreenControl({
            container: document.querySelector(`#${id}-fullscreen-wrapper`)
          })
        )
    }

    if (attributionControl) {
      map.addControl(new mapboxgl.AttributionControl(), 'bottom-left')
    }

    if (showScale) {
      map.addControl(
        new ScalePositionControl({
          maxWidth: 175
        }),
        'bottom-right'
      )
    }

    try {
      const languageControl = new MapboxLanguage()
      map.addControl(locale)
      this.languageControl = languageControl
    } catch (err) {
      console.error('failed to add langauge control')
      console.error(err)
    }

    if (disableScrollZoom) {
      map.scrollZoom.disable()
    }

    this.map = map
    this.lunr = lunr
  }

  async componentWillReceiveProps(nextProps: Props) {
    // debug.log('(' + this.state.id + ') ' +'componentWillReceiveProps');
    const { map, props, state, debugLog } = this
    const { id, mapLoaded } = state
    const {
      data,
      glStyle,
      allowLayerOrderOptimization,
      fitBounds,
      fitBoundsOptions
    } = props
    if (nextProps.data && map) {
      const geoJSONData = map.getSource('omh-geojson') as mapboxgl.GeoJSONSource

      if (geoJSONData) {
        debugLog(`(${id}) update geoJSON data`)
        // update existing data
        geoJSONData.setData(nextProps.data)
        this.zoomToData(nextProps.data)
      } else if (geoJSONData === undefined && data) {
        // do nothing, still updating from the last prop change...
      } else {
        debugLog(`(${id}) init geoJSON data`)

        if (mapLoaded) {
          this.initGeoJSON(nextProps.data)
        } else {
          debugLog(`(${id}) Skipping GeoJSON init, map not ready yet`)
        }
      }
    }

    if (
      mapLoaded && // only reload if the first load is complete
      nextProps.glStyle &&
      !_isequal(glStyle, nextProps.glStyle)
    ) {
      const nextGLStyle = nextProps.glStyle

      debugLog('glstyle changing from props')

      await Promise.resolve(
        this.setOverlayStyle(nextGLStyle, allowLayerOrderOptimization)
      )
        .catch((err) => {
          console.error('error glstyle changing')
          console.error(err)

          debugLog(err)
        })
        .asCallback((err) => {
          if (err) {
            console.error('error glstyle changing')
            console.error(err)

            debugLog(err)
          }

          const interactiveLayers = this.getInteractiveLayers(nextGLStyle)
          this.setState({
            interactiveLayers
          }) // wait to change state style until after reloaded
        })
    }

    if (
      nextProps.fitBounds &&
      !_isequal(fitBounds, nextProps.fitBounds) &&
      map
    ) {
      debugLog('FIT BOUNDS CHANGING')

      let bounds = nextProps.fitBounds

      if (nextProps.fitBounds.length > 2) {
        bounds = [
          [nextProps.fitBounds[0], nextProps.fitBounds[1]],
          [nextProps.fitBounds[2], nextProps.fitBounds[3]]
        ]
      }

      debugLog(`bounds: ${bounds.toString()}`)

      if (bounds._ne && bounds._sw) {
        map.fitBounds(bounds, fitBoundsOptions)
      } else if (Array.isArray(bounds) && bounds.length > 2) {
        map.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]]
          ],
          fitBoundsOptions
        )
      } else {
        map.fitBounds(bounds, fitBoundsOptions)
      }

      this.setState({
        allowLayersToMoveMap: false
      })
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove()
    }
  }

  startInteractive = () => {
    this.setState({
      interactive: true
    })

    if (!this.props.enableRotation) {
      this.map.dragRotate.disable()
      this.map.touchZoomRotate.disableRotation()
    }
  }
  changeBaseMap = async (mapName: string) => {
    this.debugLog('changing basemap to: ' + mapName)
    const { setBaseMapStyle, map, props } = this
    const { onChangeBaseMap, containers } = props
    const { baseMapState, mapState } = containers
    const baseMapStyle = await baseMapState.setBaseMap(mapName)
    setBaseMapStyle(baseMapStyle, true)
    this.setState({
      allowLayersToMoveMap: false
    })

    if (mapState.state.insetMap) {
      mapState.state.insetMap.reloadInset(baseMapStyle)
      mapState.state.insetMap.sync(map)
    }

    if (onChangeBaseMap) {
      onChangeBaseMap(mapName)
    }
  }

  render() {
    const {
      props,
      state,
      map,
      clearSelection,
      toggleMeasurementTools,
      measureFeatureClick,
      changeBaseMap,
      getIsochronePoint,
      clearIsochroneLayers,
      stopMeasurementTool,
      startInteractive,
      onSearch,
      onSearchResultClick,
      onSearchReset
    } = this
    let { mapboxPopup } = this
    const className = classNames('mode', 'map', 'active')
    const {
      t,
      insetMap,
      showLogo,
      logoSmall,
      logoSmallHeight,
      logoSmallWidth,
      mapLayers,
      toggleVisibility,
      showMapTools,
      showSearch,
      showFeatureInfoEditButtons,
      style,
      categories,
      gpxLink,
      showPlayButton,
      children,
      height,
      mapboxAccessToken,
      insetConfig
    } = props

    const { id, interactive, selected, selectedFeature, mapLoaded } = state

    if (selectedFeature) {
      // close any existing popups
      if (mapboxPopup?.isOpen()) {
        mapboxPopup.remove()
        mapboxPopup = undefined
      }

      let popupFeature = selectedFeature

      if (popupFeature.geometry.type !== 'Point') {
        popupFeature = turfCentroid(popupFeature)
      }

      const el = document.createElement('div')
      el.className = 'maphubs-feature-popup'
      ReactDOM.render(
        <FeaturePopup
          features={[selectedFeature]}
          selected={selected}
          showButtons={showFeatureInfoEditButtons}
          t={t}
        />,
        el
      )
      mapboxPopup = new mapboxgl.Popup()
        .setLngLat(popupFeature.geometry.coordinates)
        .setDOMContent(el)
        .addTo(map)
      mapboxPopup.on('close', clearSelection)
    } else if (mapboxPopup) {
      mapboxPopup.remove()
    }

    return (
      <div
        id={`${this.state.id}-fullscreen-wrapper`}
        className={this.props.className}
        style={style}
      >
        <style jsx global>
          {`
            .mapboxgl-canvas {
              left: 0 !important;
            }

            .mapboxgl-ctrl-maphubs {
              -moz-box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
              -webkit-box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            }

            .mapboxgl-popup {
              z-index: 200 !important;
              height: 200px;
              width: 150px;
            }

            .mapboxgl-popup-content {
              padding: 0 !important;
            }

            .mapboxgl-popup-close-button {
              top: -7px !important;
              right: -7px !important;
              z-index: 201 !important;
              background-color: rgba(255, 255, 255, 0.75) !important;
              color: black !important;
              border-radius: 25px !important;
              border: 1px solid black !important;
              width: 14px !important;
              height: 14px !important;
              line-height: 5px !important;
              padding-bottom: 1px !important;
              padding-top: 0px !important;
              padding-left: 0.5px !important;
              padding-right: 0px !important;
            }

            .maphubs-feature-popup {
              padding: 0;
            }

            .mapbox-gl-draw_point,
            .mapbox-gl-draw_line,
            .mapbox-gl-draw_polygon {
              border-bottom: none !important;
              border-right: 1px #ddd solid !important;
            }

            .mapboxgl-ctrl-logo {
              position: absolute !important;
              bottom: -5px !important;
              left: 80px !important;
            }

            .maphubs-inset .mapboxgl-ctrl-logo {
              display: none;
            }
            .mapboxgl-ctrl-top-right {
              top: 40px;
            }

            .maphubs-ctrl-scale {
              border: none !important;
              padding: 0 !important;
              background-color: inherit !important;
              position: relative;
              height: 22px;
              position: absolute;
              bottom: 5px;
              right: 5px;
              height: 34px;
              margin: 0px !important;
            }

            .map-position {
              height: 12px;
              max-width: 125px;
              width: 100vw;
              position: absolute;
              top: 0;
              right: 0;
              background-color: rgba(255, 255, 255, 0.55);
              font-size: 10px;
              line-height: 10px;
              text-align: center;
              box-shadow: none !important;
              color: #333;
            }

            .metric-scale {
              height: 12px;
              font-size: 10px;
              line-height: 10px;
              text-align: center;
              box-shadow: none !important;
              background-color: rgba(255, 255, 255, 0.55);
              border-width: medium 2px 2px;
              border-style: none solid solid;
              border-color: #333;
              padding: 0 5px;
              color: #333;
              position: absolute;
              top: 12px;
              right: 0;
            }

            .imperial-scale {
              height: 12px;
              font-size: 10px;
              line-height: 10px;
              text-align: center;
              box-shadow: none !important;
              background-color: rgba(255, 255, 255, 0.55);
              border-width: medium 2px 2px;
              border-style: solid solid none;
              border-color: #333;
              padding: 0 5px;
              color: #333;
              position: absolute;
              bottom: 0;
              right: 0;
            }

            @media (max-width: 350px) {
              .map-position {
                display: none;
              }
              .metric-scale {
                max-width: 100px;
              }
              .imperial-scale {
                max-width: 100px;
              }
            }

            @media (max-width: 280px) {
              .maphubs-inset {
                display: none;
              }
              .map-position {
                display: none;
              }
              .metric-scale {
                max-width: 75px;
              }
              .imperial-scale {
                max-width: 75px;
              }
            }
          `}
        </style>
        {categories && (
          <MapLayerMenu
            categories={categories}
            toggleVisibility={toggleVisibility}
            layers={mapLayers}
            t={t}
          />
        )}
        <div
          id={id}
          className={className}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {insetMap && (
            <InsetMap
              id={id}
              bottom={showLogo ? '30px' : '25px'}
              mapboxAccessToken={mapboxAccessToken}
              {...insetConfig}
            />
          )}
          {showMapTools && (
            <MapToolPanel
              show={this.state.interactive && this.state.mapLoaded}
              gpxLink={gpxLink}
              toggleMeasurementTools={toggleMeasurementTools}
              enableMeasurementTools={this.state.enableMeasurementTools}
              measureFeatureClick={measureFeatureClick}
              onChangeBaseMap={changeBaseMap}
              getIsochronePoint={getIsochronePoint}
              clearIsochroneLayers={clearIsochroneLayers}
              isochroneResult={this.state.isochroneResult}
              zoomToCoordinates={(lat, lon) => {
                this.flyTo([lon, lat], this.map.getZoom())
              }}
              t={t}
            />
          )}
          {this.state.enableMeasurementTools && (
            <div>
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '100px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#FFF',
                  height: '30px',
                  paddingLeft: '5px',
                  paddingRight: '5px',
                  borderRadius: '4px',
                  zIndex: 100,
                  lineHeight: '30px'
                }}
              >
                <span>{this.state.measurementMessage}</span>
              </div>
              <MapToolButton
                top='260px'
                right='10px'
                icon='close'
                show
                color='#000'
                onClick={stopMeasurementTool}
                tooltipText={t('Exit Measurement')}
                tooltipPosition='left'
              />
            </div>
          )}
          {!interactive && showPlayButton && (
            <a
              onClick={startInteractive}
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '50%',
                backgroundColor: 'rgba(25,25,25,0.1)',
                zIndex: 999
              }}
            >
              <PlayArrow />
            </a>
          )}
          {mapLoaded && children}
          {mapLoaded && showLogo && (
            <img
              style={{
                position: 'absolute',
                left: '5px',
                bottom: '2px',
                zIndex: 1
              }}
              width={logoSmallWidth}
              height={logoSmallHeight}
              src={logoSmall}
              alt='Logo'
            />
          )}
          {showSearch && (
            <MapSearchPanel
              show={interactive && mapLoaded}
              height={height}
              onSearch={onSearch}
              onSearchResultClick={onSearchResultClick}
              onSearchReset={onSearchReset}
              t={t}
              mapboxAccessToken={mapboxAccessToken}
            />
          )}
        </div>
      </div>
    )
  }

  // GeoJSONMixin
  initGeoJSON = (data: FeatureCollection) => {
    return MapGeoJSONMixin.initGeoJSON.bind(this)(data)
  }
  resetGeoJSON = () => {
    return MapGeoJSONMixin.resetGeoJSON.bind(this)()
  }
  zoomToData = (data: FeatureCollection) => {
    return MapGeoJSONMixin.zoomToData.bind(this)(data)
  }
  // MapInteractionMixin
  setSelectionFilter = (features: Array<Record<string, any>>) => {
    return MapInteractionMixin.setSelectionFilter.bind(this)(features)
  }
  clearSelectionFilter = () => {
    return MapInteractionMixin.clearSelectionFilter.bind(this)()
  }
  clearSelection = () => {
    return MapInteractionMixin.clearSelection.bind(this)()
  }
  getInteractiveLayers = (glStyle: mapboxgl.Style) => {
    return MapInteractionMixin.getInteractiveLayers.bind(this)(glStyle)
  }
  clickHandler = (e: any) => {
    return MapInteractionMixin.clickHandler.bind(this)(e)
  }
  moveendHandler = () => {
    this.debugLog('mouse up fired')
    const { baseMapState } = this.props.containers
    baseMapState.updateMapPosition(this.getPosition(), this.getBounds())
  }
  mousemoveHandler = (e: any) => {
    return MapInteractionMixin.mousemoveHandler.bind(this)(e)
  }
  // DataEditorMixin
  getFirstDrawLayerID = () => {
    return DataEditorMixin.getFirstDrawLayerID.bind(this)()
  }
  getEditorStyles = () => {
    return DataEditorMixin.getEditorStyles.bind(this)()
  }
  editFeature = (feature: Feature) => {
    return DataEditorMixin.editFeature.bind(this)(feature)
  }
  startEditingTool = (layer: Layer) => {
    return DataEditorMixin.startEditingTool.bind(this)(layer)
  }
  stopEditingTool = () => {
    return DataEditorMixin.stopEditingTool.bind(this)()
  }
  updateEdits = (e: any) => {
    return DataEditorMixin.updateEdits.bind(this)(e)
  }
  onFeatureUpdate = (type: string, feature: Record<string, any>) => {
    return DataEditorMixin.onFeatureUpdate.bind(this)(type, feature)
  }
  updateMapLayerFilters = () => {
    return DataEditorMixin.updateMapLayerFilters.bind(this)()
  }
  removeMapLayerFilters = () => {
    return DataEditorMixin.removeMapLayerFilters.bind(this)()
  }
  reloadEditingSourceCache = () => {
    return DataEditorMixin.reloadEditingSourceCache.bind(this)()
  }
  // MeasurementToolMixin
  toggleMeasurementTools = (enable: boolean) => {
    return MeasurementToolMixin.toggleMeasurementTools.bind(this)(enable)
  }
  startMeasurementTool = () => {
    return MeasurementToolMixin.startMeasurementTool.bind(this)()
  }
  stopMeasurementTool = () => {
    return MeasurementToolMixin.stopMeasurementTool.bind(this)()
  }
  updateMeasurement = (features: Array<Record<string, any>>) => {
    return MeasurementToolMixin.updateMeasurement.bind(this)(features)
  }
  measureFeatureClick = () => {
    return MeasurementToolMixin.measureFeatureClick.bind(this)()
  }
  // MapSearchMixin
  onSearch = (queryText: string) => {
    return MapSearchMixin.onSearch.bind(this)(queryText)
  }
  getFirstLabelLayer = () => {
    return MapSearchMixin.getFirstLabelLayer.bind(this)()
  }
  onSearchResultClick = (result: Record<string, any>) => {
    return MapSearchMixin.onSearchResultClick.bind(this)(result)
  }
  getSearchDisplayLayers = (
    sourceID: string,
    source: mapboxgl.Source,
    mhids: Array<string>
  ) => {
    return MapSearchMixin.getSearchDisplayLayers.bind(this)(
      sourceID,
      source,
      mhids
    )
  }
  onSearchReset = () => {
    return MapSearchMixin.onSearchReset.bind(this)()
  }
  getNameFieldForResult = (result: Record<string, any>) => {
    return MapSearchMixin.getNameFieldForResult.bind(this)(result)
  }
  getActiveLayerIds = () => {
    return MapSearchMixin.getActiveLayerIds.bind(this)()
  }
  initIndex = async () => {
    return MapSearchMixin.initIndex.bind(this)()
  }
  // MapboxGLHelperMixin
  getBounds = () => {
    return MapboxGLHelperMixin.getBounds.bind(this)()
  }
  getPosition = () => {
    return MapboxGLHelperMixin.getPosition.bind(this)()
  }
  updatePosition = () => {
    return MapboxGLHelperMixin.updatePosition.bind(this)()
  }
  flyTo = (center: any, zoom: number) => {
    return MapboxGLHelperMixin.flyTo.bind(this)(center, zoom)
  }
  getBoundsObject = (bbox: Array<number>) => {
    return MapboxGLHelperMixin.getBoundsObject.bind(this)(bbox)
  }
  fitBounds = (bbox: any, maxZoom: number, padding = 0, animate = true) => {
    return MapboxGLHelperMixin.fitBounds.bind(this)(
      bbox,
      maxZoom,
      padding,
      animate
    )
  }
  changeLocale = (locale: string, map: mapboxgl.Map) => {
    return MapboxGLHelperMixin.changeLocale.bind(this)(locale, map)
  }
  // StyleMixin
  setBaseMapStyle = (style: mapboxgl.Style, update?: boolean) => {
    return StyleMixin.setBaseMapStyle.bind(this)(style, update)
  }
  setOverlayStyle = (overlayStyle: mapboxgl.Style, optimizeLayers: boolean) => {
    return StyleMixin.setOverlayStyle.bind(this)(overlayStyle, optimizeLayers)
  }
  reloadStyle = () => {
    return StyleMixin.reloadStyle.bind(this)()
  }
  addLayer = (layer: mapboxgl.Layer, position?: number) => {
    return StyleMixin.addLayer.bind(this)(layer, position)
  }
  addLayerBefore = (layer: mapboxgl.Layer, beforeLayer: string) => {
    return StyleMixin.addLayerBefore.bind(this)(layer, beforeLayer)
  }
  addLayers = (
    layerIds: Array<{
      id: number
      position: number
    }>,
    fromStyle: mapboxgl.Style
  ) => {
    return StyleMixin.addLayers.bind(this)(layerIds, fromStyle)
  }
  removeLayer = (id: string) => {
    return StyleMixin.removeLayer.bind(this)(id)
  }
  removeLayers = (layersIDs: Array<string>, fromStyle: mapboxgl.Style) => {
    return StyleMixin.removeLayers.bind(this)(layersIDs, fromStyle)
  }
  addSource = (key: string, source: mapboxgl.Source) => {
    return StyleMixin.addSource.bind(this)(key, source)
  }
  removeSource = (key: string) => {
    return StyleMixin.removeSource.bind(this)(key)
  }
  removeSources = (sourceKeys: Array<string>, fromStyle: mapboxgl.Style) => {
    return StyleMixin.removeSources.bind(this)(sourceKeys, fromStyle)
  }
  loadSources = async (
    sourceKeys: Array<string>,
    fromStyle: mapboxgl.Style
  ) => {
    return StyleMixin.loadSources.bind(this)(sourceKeys, fromStyle)
  }
  // IsochroneMixin
  getIsochroneStyle = (data: FeatureCollection) => {
    return IsochroneMixin.getIsochroneStyle.bind(this)(data)
  }
  getIsochronePoint = () => {
    return IsochroneMixin.getIsochronePoint.bind(this)()
  }
  runIsochroneQuery = (point: { lng: number; lat: number }) => {
    return IsochroneMixin.runIsochroneQuery.bind(this)(point)
  }
  clearIsochroneLayers = () => {
    return IsochroneMixin.clearIsochroneLayers.bind(this)()
  }
  saveIsochroneLayer = () => {
    return IsochroneMixin.saveIsochroneLayer.bind(this)()
  }
}

export default subscribe(Map, {
  baseMapState: BaseMapContainer,
  dataEditorState: DataEditorContainer,
  mapState: MapContainer
}) as unknown as typeof Map
