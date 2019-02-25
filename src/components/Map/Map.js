// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import connect from 'unstated-connect'
import FeaturePopup from './FeaturePopup'
import BaseMapContainer from './containers/BaseMapContainer'
import DataEditorContainer from './containers/DataEditorContainer'
import MapContainer from './containers/MapContainer'
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
import Promise from 'bluebird'
import turfCentroid from '@turf/centroid'
import PlayArrow from '@material-ui/icons/PlayArrow'
import type {GLStyle, GLSource, GLLayer} from '../../types/mapbox-gl-style'
import type {GeoJSONObject} from 'geojson-flow'
import type {Layer} from '../../types/layer'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import $ from 'jquery'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('map')

let mapboxgl = {}
let ArcGISTiledMapServiceSource
let ScalePositionControl

type Props = {|
    className: string,
    id: string,
    maxBounds?: Object,
    maxZoom?: number,
    minZoom?: number,
    height: string,
    style: Object,
    glStyle?: GLStyle,
    features?: Array<Object>,
    tileJSONType?: string,
    tileJSONUrl?: string,
    data?: GeoJSONObject,
    interactive: boolean,
    showPlayButton: boolean,
    showLogo: boolean,
    showScale: boolean,
    showFeatureInfoEditButtons: boolean,
    fitBounds?: NestedArray<number>,
    fitBoundsOptions: Object,
    disableScrollZoom?: boolean,
    enableRotation?: boolean,
    navPosition: string,
    baseMap: string,
    onChangeBaseMap?: Function,
    insetMap: boolean,
    hoverInteraction: boolean,
    interactionBufferSize: number,
    hash: boolean,
    gpxLink?: string,
    attributionControl:boolean,
    allowLayerOrderOptimization: boolean,
    preserveDrawingBuffer?: boolean,
    mapConfig: Object,
    insetConfig: Object,
    onToggleForestLoss?: Function,
    onToggleIsochroneLayer?: Function,
    children?: any,
    containers: Array<Object>,
    onLoad: Function,
    t: Function,
    locale: string,
    logoSmall?: string,
    logoSmallWidth?: number,
    logoSmallHeight?: number
  |}

  type State = {
    id: string,
    selectedFeature?: Object,
    selected: boolean,
    interactive: boolean,
    interactiveLayers: Array<Object>,
    mapLoaded: boolean,
    allowLayersToMoveMap: boolean,
    measurementMessage?: string,
    enableMeasurementTools?: boolean,
    isochroneResult?: Object
  }

class Map extends React.Component<Props, State> {
  static defaultProps = {
    maxZoom: 18,
    minZoom: 5,
    className: '',
    interactive: true,
    showFeatureInfoEditButtons: true,
    showPlayButton: true,
    navPosition: 'top-right',
    baseMap: 'default',
    showLogo: true,
    insetMap: true,
    showScale: true,
    hoverInteraction: false,
    interactionBufferSize: 10,
    hash: true,
    attributionControl: false,
    preserveDrawingBuffer: false,
    style: {},
    allowLayerOrderOptimization: true,
    fitBoundsOptions: {animate: false},
    height: '100%',
    mapConfig: {},
    insetConfig: {}
  }

  map: Object
  overlayMapStyle: Object
  mapboxPopup: any
  glStyle: Object
  lunr: any
  idx: any
  searchSourceIds: any

  constructor (props: Props) {
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

  componentWillMount () {
    // TODO: this is a hack, need to move state helper functions the containers instead of attached to the instance
    const [BaseMapState, , MapState] = this.props.containers
    MapState.setMap(this)
    BaseMapState.setBaseMap(this.props.baseMap)
    if (this.props.glStyle) {
      const interactiveLayers = this.getInteractiveLayers(this.props.glStyle)
      this.setState({interactiveLayers})
    }
  }

  componentDidMount () {
    mapboxgl = require('mapbox-gl')
    ArcGISTiledMapServiceSource = require('mapbox-gl-arcgis-tiled-map-service')
    ScalePositionControl = require('mapbox-gl-dual-scale-control')
    this.lunr = require('lunr')
    this.createMap()
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    // switch to interactive
    if (this.state.interactive && !prevState.interactive) {
      this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), this.props.navPosition)
      this.map.addControl(new mapboxgl.FullscreenControl(), this.props.navPosition)
      if (this.map.dragPan) this.map.dragPan.enable()
      if (this.map.scrollZoom) this.map.scrollZoom.enable()
      if (this.map.doubleClickZoom) this.map.doubleClickZoom.enable()
      if (this.map.touchZoomRotate) this.map.touchZoomRotate.enable()
    }
    // change locale
    if (this.props.locale && (this.props.locale !== prevProps.locale)) {
      this.changeLocale(this.props.locale, this.map)
      const [, , MapState] = this.props.containers
      if (MapState.state.insetMap) {
        this.changeLocale(this.props.locale, MapState.state.insetMap.getInsetMap())
      }
    }
  }

  debugLog = (msg: string) => {
    debug.log(`(${this.state.id}) ${msg}`)
  }

  addMapData = (map: any, glStyle?: GLStyle, geoJSON?: GeoJSONObject, cb: Function) => {
    this.debugLog('addMapData')
    const _this = this
    const style = this.overlayMapStyle || glStyle
    if (style && style.sources) {
      return Promise.resolve(_this.setOverlayStyle(style, _this.props.allowLayerOrderOptimization))
        .catch((err) => {
          _this.debugLog(err)
        })
        .asCallback((err) => {
          if (err) {
            this.debugLog(err)
          }
          if (geoJSON) {
            _this.initGeoJSON(geoJSON)
          }
          cb()
        })
    } else if (geoJSON) {
      _this.initGeoJSON(geoJSON)
      cb()
    } else {
      cb()
    }
  }

  createMap = () => {
    const _this = this
    this.debugLog('Creating MapboxGL Map')
    mapboxgl.accessToken = MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    const {debugLog} = this
    const {preserveDrawingBuffer, enableRotation, hash, fitBounds, fitBoundsOptions, data, glStyle, attributionControl, t, locale} = this.props
    const {interactive, mapLoaded} = this.state
    const [BaseMapState, , MapState] = this.props.containers
    BaseMapState.getBaseMapFromName(this.props.baseMap, (baseMap) => {
      _this.setBaseMapStyle(baseMap, false)

      if (!mapboxgl || !mapboxgl.supported || !mapboxgl.supported()) {
        alert(t('Your browser does not support Mapbox GL please see: https://help.maphubs.com/getting-started/troubleshooting-common-issues'))
        return
      }

      const map = new mapboxgl.Map({
        container: _this.state.id,
        style: _this.glStyle,
        zoom: 0,
        interactive,
        dragRotate: !!enableRotation,
        touchZoomRotate: !!enableRotation,
        preserveDrawingBuffer,
        center: [0, 0],
        hash,
        attributionControl: false,
        transformRequest: (url, resourceType) => {
          if (map.authUrlStartsWith && url.startsWith(map.authUrlStartsWith)) {
            return {
              url: url,
              headers: { 'Authorization': 'Basic ' + map.authToken },
              credentials: 'include'
            }
          }
        }
      })

      map.addSourceType('arcgisraster', ArcGISTiledMapServiceSource, (err) => {
        if (err) {
          debug.error(err)
        } else {
          debugLog('Added custom source: arcgisraster')
        }
      })

      // catch generic errors so 404 tile errors etc don't cause unexpected issues
      map.on('error', (err) => {
        debug.error(err.error)
      })

      map.on('load', () => {
        debugLog('MAP LOADED')
        // add selector for screenshot tool
        setTimeout(() => {
          $('body').append(`<div id="map-load-complete" style="display: none;"></div>`)
        }, 5000)
      })

      map.on('style.load', () => {
        debugLog('style.load')
        // restore map bounds (except for geoJSON maps)
        if (!data && // use bbox for GeoJSON data
          !mapLoaded && // only set map position on first style load (not after changing base map etc)
          fitBounds // bounds are provided in Props
        ) {
          let bounds = fitBounds
          if (bounds && bounds.length > 2) {
            bounds = [[fitBounds[0], fitBounds[1]], [fitBounds[2], fitBounds[3]]]
          }
          debugLog(`fitting map to bounds: ${bounds.toString()}`)
          map.fitBounds(fitBounds, fitBoundsOptions)
          if (MapState.state.insetMap) {
            MapState.state.insetMap.sync(map)
          } else {
            debugLog(`insetMap not found`)
          }
        }

        // add the omh data
        _this.addMapData(map, glStyle, data, () => {
          // do stuff that needs to happen after data loads
          debugLog('finished adding map data')

          // set locale
          if (locale) {
            try {
              _this.changeLocale(locale, _this.map)
              if (MapState.state.insetMap) {
                _this.changeLocale(locale, MapState.state.insetMap.getInsetMap())
              }
            } catch (err) {
              debug.error(err)
            }
          }

          _this.setState({mapLoaded: true})
          if (_this.props.onLoad) _this.props.onLoad()
        })
      })// end style.load

      // Setup inset map
      if (MapState.state.insetMap) {
        if (!MapState.state.insetMap.getInsetMap()) {
          MapState.initInset(map, baseMap)
        }
      } else {
        debugLog(`failed to init inset`)
      }

      map.on('mousemove', _this.mousemoveHandler)
      map.on('moveend', _this.moveendHandler)
      map.on('click', _this.clickHandler)

      if (interactive) {
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), _this.props.navPosition)
        map.addControl(new mapboxgl.FullscreenControl())
      }

      if (attributionControl) {
        map.addControl(new mapboxgl.AttributionControl(), 'bottom-left')
      }

      if (_this.props.showScale) {
        map.addControl(new ScalePositionControl({
          maxWidth: 175
        }), 'bottom-right')
      }

      if (_this.props.disableScrollZoom) {
        map.scrollZoom.disable()
      }

      _this.map = map
    })
  }

  async componentWillReceiveProps (nextProps: Props) {
    // debug.log('(' + this.state.id + ') ' +'componentWillReceiveProps');
    const _this = this
    const [BaseMapState] = this.props.containers
    if (nextProps.data && this.map) {
      const geoJSONData = this.map.getSource('omh-geojson')
      if (geoJSONData) {
        debug.log('(' + this.state.id + ') ' + 'update geoJSON data')
        // update existing data
        geoJSONData.setData(nextProps.data)
        this.zoomToData(nextProps.data)
      } else if (geoJSONData === undefined && this.props.data) {
        // do nothing, still updating from the last prop change...
      } else {
        debug.log('(' + this.state.id + ') ' + 'init geoJSON data')
        if (this.state.mapLoaded && nextProps.data) {
          this.initGeoJSON(nextProps.data)
        } else {
          debug.log(`(${this.state.id}) Skipping GeoJSON init, map not ready yet`)
        }
      }
    }

    let fitBoundsChanging = false
    let bounds: any
    let allowLayersToMoveMap = this.state.allowLayersToMoveMap

    if (nextProps.fitBounds && !_isequal(this.props.fitBounds, nextProps.fitBounds) && this.map) {
      _this.debugLog('FIT BOUNDS CHANGING')
      fitBoundsChanging = true
      allowLayersToMoveMap = false
      if (nextProps.fitBounds && nextProps.fitBounds.length > 2) {
        bounds = [[nextProps.fitBounds[0], nextProps.fitBounds[1]], [nextProps.fitBounds[2], nextProps.fitBounds[3]]]
      } else {
        bounds = nextProps.fitBounds
      }
      if (bounds) {
        debug.log('(' + this.state.id + ') ' + 'bounds: ' + bounds.toString())
      }
    }

    if (nextProps.glStyle && nextProps.baseMap) {
      const nextGLStyle = nextProps.glStyle
      if (!_isequal(this.props.glStyle, nextGLStyle)) {
        _this.debugLog('glstyle changing from props')
        //* * Style Changing (also reloads basemap if needed) **/
        if (this.state.mapLoaded && !fitBoundsChanging) {
          // if fitBounds isn't changing, restore the current map position
          if (this.glStyle !== null) {
            this.debugLog('restoring current map position')
            allowLayersToMoveMap = false
          }
        }
        this.setState({allowLayersToMoveMap})

        if (!_isequal(BaseMapState.state.baseMap, nextProps.baseMap)) {
          await BaseMapState.setBaseMap(nextProps.baseMap)
          await BaseMapState.getBaseMapFromName(nextProps.baseMap, (baseMapStyle) => {
            _this.setBaseMapStyle(baseMapStyle, false)
          })
        }

        return Promise.resolve(_this.setOverlayStyle(nextGLStyle, _this.props.allowLayerOrderOptimization))
          .catch((err) => {
            _this.debugLog(err)
          })
          .asCallback((err) => {
            if (err) {
              _this.debugLog(err)
            }
            const interactiveLayers = _this.getInteractiveLayers(nextGLStyle)
            _this.setState({interactiveLayers})
          })
      } else if (this.props.baseMap !== nextProps.baseMap) {
        //* * Style Not Changing, but Base Map is Changing **/
        /*
        _this.debugLog(`basemap changing from props (${this.state.baseMap} -> ${nextProps.baseMap})`)
        allowLayersToMoveMap = false
        this.setState({allowLayersToMoveMap})

        this.changeBaseMap(nextProps.baseMap)
        */
      } else if (fitBoundsChanging) {
        //* * just changing the fit bounds
        // in this case we can fitBounds directly since we are not waiting for the map to reload styles first
        if (bounds) {
          _this.debugLog('only bounds changing, bounds: ' + bounds)
          if (Array.isArray(bounds) && bounds.length > 2) {
            bounds = [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]
          }
          debug.log('(' + this.state.id + ') ' + 'calling map fitBounds')
          this.map.fitBounds(bounds, this.props.fitBoundsOptions)

          this.setState({allowLayersToMoveMap})
        }
      }
    } else if (nextProps.glStyle &&
      !_isequal(this.props.glStyle, nextProps.glStyle)) {
      const nextGLStyle = nextProps.glStyle
      //* * Style Changing (no basemap provided) **/
      _this.debugLog('glstyle changing from props (default basemap)')
      return Promise.resolve(this.setOverlayStyle(nextGLStyle, _this.props.allowLayerOrderOptimization))
        .catch((err) => {
          _this.debugLog(err)
        })
        .asCallback((err) => {
          if (err) {
            _this.debugLog(err)
          }
          const interactiveLayers = this.getInteractiveLayers(nextGLStyle)
          this.setState({allowLayersToMoveMap, interactiveLayers}) // wait to change state style until after reloaded
        })
    } else if (nextProps.baseMap &&
      !_isequal(BaseMapState.state.baseMap, nextProps.baseMap)) {
      //* * Style Not Found, but Base Map is Changing **/
      _this.debugLog('basemap changing from props (no glstyle)')

      this.setState({allowLayersToMoveMap})
      await BaseMapState.setBaseMap(nextProps.baseMap)
      await BaseMapState.getBaseMapFromName(nextProps.baseMap, (baseMapStyle) => {
        _this.setBaseMapStyle(baseMapStyle, true)
      })
    } else if (fitBoundsChanging) {
      //* * just changing the fit bounds on a map that does not have styles or basemap settings **/
      // in this case we can fitBounds directly since we are not waiting for the map to reload styles first
      if (bounds) {
        _this.debugLog('only bounds changing')
        if (bounds._ne && bounds._sw) {
          this.map.fitBounds(bounds, this.props.fitBoundsOptions)
        } else if (Array.isArray(bounds) && bounds.length > 2) {
          this.map.fitBounds([[bounds[0], bounds[1]],
            [bounds[2], bounds[3]]], this.props.fitBoundsOptions)
        } else {
          this.map.fitBounds(bounds, this.props.fitBoundsOptions)
        }
        this.setState({allowLayersToMoveMap})
      }
    }
  }

  componentWillUnmount () {
    if (this.map) {
      this.map.remove()
    }
  }

  startInteractive = () => {
    this.setState({interactive: true})
    if (!this.props.enableRotation) {
      this.map.dragRotate.disable()
      this.map.touchZoomRotate.disableRotation()
    }
  }

  changeBaseMap = async (mapName: string) => {
    this.debugLog('changing basemap to: ' + mapName)
    const _this = this
    const {setBaseMapStyle, map} = this
    const {onChangeBaseMap} = this.props
    const [BaseMapState, , MapState] = this.props.containers
    await BaseMapState.getBaseMapFromName(mapName, (baseMapStyle) => {
      BaseMapState.setBaseMap(mapName)
      _this.setState({allowLayersToMoveMap: false})
      setBaseMapStyle(baseMapStyle, true)

      if (MapState.state.insetMap) {
        MapState.state.insetMap.reloadInset(baseMapStyle)
        MapState.state.insetMap.sync(map)
      }

      if (onChangeBaseMap) {
        onChangeBaseMap(mapName)
      }
    })
  }

  render () {
    const className = classNames('mode', 'map', 'active')
    const {t, insetMap, showLogo, logoSmall, logoSmallHeight, logoSmallWidth} = this.props
    if (this.state.selectedFeature) {
      // close any existing popups
      if (this.mapboxPopup && this.mapboxPopup.isOpen()) {
        this.mapboxPopup.remove()
        this.mapboxPopup = undefined
      }

      let popupFeature = this.state.selectedFeature
      if (popupFeature.geometry.type !== 'Point') {
        popupFeature = turfCentroid(popupFeature)
      }

      const el = document.createElement('div')
      el.className = 'maphubs-feature-popup'
      ReactDOM.render(
        <FeaturePopup
          features={[this.state.selectedFeature]}
          selected={this.state.selected}
          showButtons={this.props.showFeatureInfoEditButtons}
          t={t}
        />,
        el
      )

      this.mapboxPopup = new mapboxgl.Popup()
        .setLngLat(popupFeature.geometry.coordinates)
        .setDOMContent(el)
        .addTo(this.map)

      this.mapboxPopup.on('close', this.clearSelection)
    } else if (this.mapboxPopup) {
      this.mapboxPopup.remove()
    }

    return (
      <div className={this.props.className} style={this.props.style}>
        <style jsx global>{`

          .mapboxgl-canvas{
            left: 0 !important;
          }
          
          .mapboxgl-ctrl {
            -moz-box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12) !important;
            -webkit-box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12) !important;
            box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12) !important;
          }

          .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl {
            margin: 0 !important;
          }

          .mapboxgl-popup {
            z-index: 200 !important;
            height: 200px;
            width: 150px;
          }

          .mapboxgl-popup-content{
            padding: 0 !important;
          }

          .mapboxgl-popup-close-button{
            top: -7px !important;
            right: -7px !important;
            z-index: 201 !important;
            background-color: rgba(255, 255, 255, 0.75) !important;
            color: $maphubs-accent-color !important;
            border-radius: 25px !important;
            border: 1px solid $maphubs-accent-color !important;
            width: 14px !important;
            height: 14px !important;
            line-height: 5px !important;
            padding-bottom: 1px !important;
            padding-top: 0px !important;
            padding-left: 0.5px !important;
            padding-right: 0px !important;
          }

          .maphubs-feature-popup{
            padding: 0;
          }

          .mapbox-gl-draw_point, .mapbox-gl-draw_line, .mapbox-gl-draw_polygon{
            border-bottom: none !important;
            border-right: 1px #ddd solid !important;
          }

          .mapboxgl-ctrl-logo {
            display: none !important;
          }

          .mapboxgl-ctrl-top-right {
            top: 40px !important;
          }

          .maphubs-ctrl-scale {
            border: none !important;
            padding: 0  !important;
            background-color: inherit  !important;
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
            width: 75px;
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

        `}</style>
        <div id={this.state.id} className={className} style={{width: '100%', height: '100%'}}>
          {insetMap &&
            <InsetMap id={this.state.id} bottom={showLogo ? '30px' : '25px'} {...this.props.insetConfig} />
          }
          <MapToolPanel show={this.state.interactive && this.state.mapLoaded}
            height={this.props.height}
            gpxLink={this.props.gpxLink}
            toggleMeasurementTools={this.toggleMeasurementTools}
            enableMeasurementTools={this.state.enableMeasurementTools}
            measureFeatureClick={this.measureFeatureClick}
            onChangeBaseMap={this.changeBaseMap}
            getIsochronePoint={this.getIsochronePoint}
            clearIsochroneLayers={this.clearIsochroneLayers}
            isochroneResult={this.state.isochroneResult}
            t={t}
          />
          {this.state.enableMeasurementTools &&
            <div>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '100px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#FFF',
                height: '30px',
                paddingLeft: '5px',
                paddingRight: '5px',
                borderRadius: '4px',
                zIndex: '100',
                lineHeight: '30px'
              }}>
                <span>{this.state.measurementMessage}</span>
              </div>
              <MapToolButton top='260px' right='10px' icon='close' show color='#000'
                onClick={this.stopMeasurementTool} tooltipText={t('Exit Measurement')} />
            </div>
          }
          {(!this.state.interactive && this.props.showPlayButton) &&
            <a onClick={this.startInteractive} className='btn-floating waves-effect waves-light'
              style={{position: 'absolute', left: '50%', bottom: '50%', backgroundColor: 'rgba(25,25,25,0.1)', zIndex: '999'}}>
              <PlayArrow />
            </a>
          }
          {this.state.mapLoaded &&
            this.props.children
          }
          {(this.state.mapLoaded && this.props.showLogo) &&
            <img style={{position: 'absolute', left: '5px', bottom: '2px', zIndex: '1'}} width={logoSmallWidth} height={logoSmallHeight} src={logoSmall} alt='Logo' />
          }
          <MapSearchPanel
            show={this.state.interactive && this.state.mapLoaded}
            height={this.props.height}
            onSearch={this.onSearch}
            onSearchResultClick={this.onSearchResultClick}
            onSearchReset={this.onSearchReset}
            t={t}
          />
        </div>
      </div>
    )
  }

  // GeoJSONMixin
  initGeoJSON = (data: GeoJSONObject) => {
    return MapGeoJSONMixin.initGeoJSON.bind(this)(data)
  }

  resetGeoJSON = () => {
    return MapGeoJSONMixin.resetGeoJSON.bind(this)()
  }

  zoomToData = (data: GeoJSONObject) => {
    return MapGeoJSONMixin.zoomToData.bind(this)(data)
  }

  // MapInteractionMixin
  setSelectionFilter = (features: Array<Object>) => {
    return MapInteractionMixin.setSelectionFilter.bind(this)(features)
  }

  clearSelectionFilter = () => {
    return MapInteractionMixin.clearSelectionFilter.bind(this)()
  }

  clearSelection = () => {
    return MapInteractionMixin.clearSelection.bind(this)()
  }

  getInteractiveLayers = (glStyle: GLStyle) => {
    return MapInteractionMixin.getInteractiveLayers.bind(this)(glStyle)
  }

  clickHandler = (e: any) => {
    return MapInteractionMixin.clickHandler.bind(this)(e)
  }

  moveendHandler = () => {
    debug.log('mouse up fired')
    const [BaseMapState] = this.props.containers
    BaseMapState.updateMapPosition(this.getPosition(), this.getBounds())
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

  editFeature = (feature: Object) => {
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

  onFeatureUpdate = (type: string, feature: Object) => {
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

  updateMeasurement = (features: Array<Object>) => {
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

  onSearchResultClick = (result: Object) => {
    return MapSearchMixin.onSearchResultClick.bind(this)(result)
  }

  getSearchDisplayLayers = (sourceID: string, source: GLSource, mhids: Array<string>) => {
    return MapSearchMixin.getSearchDisplayLayers.bind(this)(sourceID, source, mhids)
  }

  onSearchReset = () => {
    return MapSearchMixin.onSearchReset.bind(this)()
  }

  getNameFieldForResult = (result: Object) => {
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

  fitBounds = (bbox: any, maxZoom: number, padding: number = 0, animate: boolean = true) => {
    return MapboxGLHelperMixin.fitBounds.bind(this)(bbox, maxZoom, padding, animate)
  }

  changeLocale = (locale: string, map: any) => {
    return MapboxGLHelperMixin.changeLocale.bind(this)(locale, map)
  }

  // StyleMixin
  setBaseMapStyle = (style: GLStyle, update?: boolean) => {
    return StyleMixin.setBaseMapStyle.bind(this)(style, update)
  }

  setOverlayStyle = (overlayStyle: GLStyle, optimizeLayers: boolean) => {
    return StyleMixin.setOverlayStyle.bind(this)(overlayStyle, optimizeLayers)
  }

  reloadStyle = () => {
    return StyleMixin.reloadStyle.bind(this)()
  }

  addLayer = (layer: GLLayer, position?: number) => {
    return StyleMixin.addLayer.bind(this)(layer, position)
  }

  addLayerBefore = (layer: GLLayer, beforeLayer: string) => {
    return StyleMixin.addLayerBefore.bind(this)(layer, beforeLayer)
  }

  addLayers = (layerIds: Array<{id: number, position: number}>, fromStyle: GLStyle) => {
    return StyleMixin.addLayers.bind(this)(layerIds, fromStyle)
  }

  removeLayer = (id: string) => {
    return StyleMixin.removeLayer.bind(this)(id)
  }

  removeLayers = (layersIDs: Array<string>, fromStyle: GLStyle) => {
    return StyleMixin.removeLayers.bind(this)(layersIDs, fromStyle)
  }

  addSource = (key: string, source: GLSource) => {
    return StyleMixin.addSource.bind(this)(key, source)
  }

  removeSource = (key: string) => {
    return StyleMixin.removeSource.bind(this)(key)
  }

  removeSources = (sourceKeys: Array<string>, fromStyle: GLStyle) => {
    return StyleMixin.removeSources.bind(this)(sourceKeys, fromStyle)
  }

  loadSources = async (sourceKeys: Array<string>, fromStyle: GLStyle) => {
    return StyleMixin.loadSources.bind(this)(sourceKeys, fromStyle)
  }

  // IsochroneMixin
  getIsochroneStyle = (data: GeoJSONObject) => {
    return IsochroneMixin.getIsochroneStyle.bind(this)(data)
  }

  getIsochronePoint = () => {
    return IsochroneMixin.getIsochronePoint.bind(this)()
  }

  runIsochroneQuery = (point: {lng: number, lat: number}) => {
    return IsochroneMixin.runIsochroneQuery.bind(this)(point)
  }

  clearIsochroneLayers = () => {
    return IsochroneMixin.clearIsochroneLayers.bind(this)()
  }

  saveIsochroneLayer = () => {
    return IsochroneMixin.saveIsochroneLayer.bind(this)()
  }
}

export default connect([BaseMapContainer, DataEditorContainer, MapContainer])(Map)
