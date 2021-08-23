/**
 * Note: SSR not supported, needs to be loaded dynamically in NextJS
 */
import React, { useRef, useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import FeaturePopup from './FeaturePopup'
import _bbox from '@turf/bbox'
import _debounce from 'lodash.debounce'
import MapToolButton from './MapToolButton'
import MapSearchPanel from './Search/MapSearchPanel'
import MapToolPanel from './MapToolPanel'
import InsetMap from './InsetMap'
import turfCentroid from '@turf/centroid'
import PlayArrow from '@material-ui/icons/PlayArrow'
import MapLayerMenu from './MapLayerMenu'
import { Layer } from '../../../types/layer'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import $ from 'jquery'
import DebugService from '../lib/debug'
import { Feature, FeatureCollection, Point } from 'geojson'
import mapboxgl from 'mapbox-gl'
import ScalePositionControl from 'mapbox-gl-dual-scale-control'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import {
  initMap,
  setEnableMeasurementTools,
  setAllowLayersToMoveMap,
  setInteractiveLayers
} from '../redux/reducers/mapSlice'
import {
  setBaseMapThunk,
  setMapboxAccessToken,
  updateMapPosition
} from '../redux/reducers/baseMapSlice'
import { changeLocale } from '../redux/reducers/localeSlice'
import { setClickedFeature } from '../redux/reducers/dataEditorSlice'
import { setBaseMapStyleThunk } from '../redux/reducers/map/setBaseMapStyleThunk'
import { setOverlayStyleThunk } from '../redux/reducers/map/setOverlayStyleThunk'
import { useDispatch, useSelector } from '../redux/hooks'
import useMapT from '../hooks/useMapT'
import MapStyles from './Styles'

const debug = DebugService('map')
type Props = {
  className?: string
  id?: string
  maxBounds?: Record<string, any>
  maxZoom?: number
  minZoom?: number
  zoom?: number
  initialBaseMap?: string
  initialGLStyle?: mapboxgl.Style
  features?: Array<Record<string, any>>
  tileJSONType?: string
  tileJSONUrl?: string
  data?: FeatureCollection
  interactive?: boolean
  showPlayButton?: boolean
  showLogo?: boolean
  showScale?: boolean
  showFeatureInfoEditButtons?: boolean
  fitBounds?:
    | [[number, number], [number, number]]
    | [number, number, number, number]
  fitBoundsOptions?: Record<string, any>
  disableScrollZoom?: boolean
  enableRotation?: boolean
  navPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  onChangeBaseMap?: (...args: Array<any>) => any
  insetMap?: boolean
  interactionBufferSize?: number
  hash?: boolean
  gpxLink?: string
  attributionControl?: boolean
  allowLayerOrderOptimization?: boolean
  preserveDrawingBuffer?: boolean
  mapConfig: Record<string, any>
  insetConfig?: Record<string, any>
  children?: JSX.Element | JSX.Element[]
  onLoad?: (...args: Array<any>) => void
  locale: string
  mapboxAccessToken: string
  DGWMSConnectID?: string
  earthEngineClientID?: string
  categories?: Array<Record<string, any>>
  mapLayers?: Layer[]
  toggleVisibility?: (...args: Array<any>) => void
  showMapTools?: boolean
  showSearch?: boolean
  showFullScreen?: boolean
}

const getInteractiveLayers = (_glStyle: mapboxgl.Style) => {
  const interactiveLayers = []

  if (_glStyle?.layers) {
    const layers = _glStyle.layers as Array<
      mapboxgl.Layer & { metadata: Record<string, unknown> }
    >
    for (const layer of layers) {
      if (
        layer.metadata &&
        layer.metadata['maphubs:interactive'] &&
        (layer.id.startsWith('omh') || layer.id.startsWith('osm'))
      ) {
        interactiveLayers.push(layer.id)
      }
    }
  }
  return interactiveLayers
}

const MapHubsMap = ({
  allowLayerOrderOptimization,
  disableScrollZoom,
  showScale,
  showFullScreen,
  navPosition,
  id,
  locale,
  fitBounds,
  fitBoundsOptions,
  hash,
  data,
  zoom,
  minZoom,
  maxZoom,
  preserveDrawingBuffer,
  enableRotation,
  attributionControl,
  onLoad,
  initialGLStyle,
  initialBaseMap,
  interactive,
  insetMap,
  showLogo,
  mapLayers,
  toggleVisibility,
  showMapTools,
  showSearch,
  showFeatureInfoEditButtons,
  categories,
  gpxLink,
  showPlayButton,
  children,
  mapboxAccessToken,
  insetConfig,
  interactionBufferSize,
  onChangeBaseMap
}: Props): JSX.Element => {
  const { t } = useMapT()
  const dispatch = useDispatch()
  const mapRef = useRef<mapboxgl.Map>()

  const mapboxPopupRef = useRef<mapboxgl.Popup>()
  const languageControlRef = useRef()

  // local state
  const [interactionActive, setInteractionActive] = useState(interactive)
  const [selected, setSelected] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<Feature>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)

  // map state
  const baseMap = useSelector((state) => state.baseMap.baseMap)

  //const overlayMapStyle = useSelector((state) => state.map.overlayMapStyle)
  const allowLayersToMoveMap = useSelector(
    (state) => state.map.allowLayersToMoveMap
  )
  const glStyle = useSelector((state) => state.map.glStyle)
  const enableMeasurementTools = useSelector(
    (state) => state.map.enableMeasurementTools
  )
  const measurementMessage = useSelector(
    (state) => state.map.measurementMessage
  )

  // dataEditor state
  const editingLayer = useSelector((state) => state.dataEditor.editingLayer)
  const editing = useSelector((state) => state.dataEditor.editing)

  useEffect(() => {
    dispatch(setMapboxAccessToken(mapboxAccessToken))
  }, [mapboxAccessToken, dispatch])

  // do not allow layers to position the map if user is providing the location
  useEffect(() => {
    dispatch(setAllowLayersToMoveMap(!fitBounds))
  }, [fitBounds, dispatch])

  const initGeoJSON = useCallback(
    async (data: FeatureCollection): Promise<void> => {
      if (mapRef.current) {
        if (
          data &&
          data.features &&
          Array.isArray(data.features) &&
          data.features.length > 0
        ) {
          mapRef.current.addSource('omh-geojson', {
            type: 'geojson',
            data
          })
          const glStyle = MapStyles.style.defaultStyle(
            9_999_999,
            'geojson',
            null,
            null
          )
          // glStyle.sources["omh-geojson"] = {"type": "geojson", data};
          glStyle.layers.map((layer) => {
            mapRef.current.addLayer(layer)
          })
          const interactiveLayers = getInteractiveLayers(glStyle)
          dispatch(setInteractiveLayers(interactiveLayers))

          zoomToData(data)
        } else {
          // empty data
          debug.log(`(${id}) Empty/Missing GeoJSON Data`)
        }
      } else {
        debug.log(`(${id}) Map not initialized`)
      }
    },
    [dispatch, id]
  )

  const clearSelection = useCallback(async (): Promise<void> => {
    if (mapRef.current && glStyle) {
      for (const layer of glStyle.layers) {
        if (
          layer.id.startsWith('omh-hover') &&
          mapRef.current.getLayer(layer.id)
        ) {
          mapRef.current.setFilter(layer.id, ['==', 'mhid', ''])
        }
      }
    }
    setSelected(false)
    setSelectedFeature(null)
  }, [glStyle])

  // create the map if on first load or if glStyle props has changed
  useEffect(() => {
    const setSelectionFilter = (features: Feature[]) => {
      if (glStyle?.layers) {
        for (const layer of glStyle.layers) {
          const filter = ['in', 'mhid']
          for (const feature of features) {
            filter.push(feature.properties.mhid)
          }

          if (
            mapRef.current.getLayer(layer.id) &&
            filter[2] // found a mhid
          ) {
            if (layer.id.startsWith('omh-hover-point')) {
              mapRef.current.setFilter(layer.id, [
                'all',
                ['in', '$type', 'Point'],
                filter
              ])
            } else if (layer.id.startsWith('omh-hover-line')) {
              mapRef.current.setFilter(layer.id, [
                'all',
                ['in', '$type', 'LineString'],
                filter
              ])
            } else if (layer.id.startsWith('omh-hover-polygon')) {
              mapRef.current.setFilter(layer.id, [
                'all',
                ['in', '$type', 'Polygon'],
                filter
              ])
            }
          }
        }
      }
    }

    // fires whenever mouse is moving across the map... use for cursor interaction... hover etc.
    const mousemoveHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!mapRef.current) return

      if (!enableMeasurementTools) {
        const debounced = _debounce(() => {
          try {
            const features = mapRef.current.queryRenderedFeatures(
              [
                [
                  e.point.x - interactionBufferSize / 2,
                  e.point.y - interactionBufferSize / 2
                ],
                [
                  e.point.x + interactionBufferSize / 2,
                  e.point.y + interactionBufferSize / 2
                ]
              ],
              {
                layers: interactiveLayers
              }
            )

            if (features && features.length > 0) {
              if (selected) {
                $(mapRef.current)
                  .find('.mapboxgl-canvas-container')
                  .css('cursor', 'crosshair')
              } else {
                $(mapRef.current)
                  .find('.mapboxgl-canvas-container')
                  .css('cursor', 'pointer')
              }
            } else if (!selected && selectedFeature) {
              clearSelection()

              $(mapRef.current)
                .find('.mapboxgl-canvas-container')
                .css('cursor', '')
            } else {
              $(mapRef.current)
                .find('.mapboxgl-canvas-container')
                .css('cursor', '')
            }
          } catch (err) {
            console.log(err)
          }
        }, 300)

        debounced()
      }
    }

    const moveendHandler = () => {
      debug.log(`(${id}) mouse up fired`)
      const center = mapRef.current.getCenter()
      const zoom = mapRef.current.getZoom()
      const bounds = mapRef.current.getBounds().toArray()
      const position = {
        zoom,
        lng: center.lng,
        lat: center.lat,
        bbox: bounds
      }
      dispatch(updateMapPosition({ position, bbox: bounds }))
    }
    const clickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!enableMeasurementTools) {
        // feature selection
        if (!selected && selectedFeature) {
          setSelected(true)
        } else {
          $(mapRef.current)
            .find('.mapboxgl-canvas-container')
            .css('cursor', 'crosshair')
          const features = mapRef.current.queryRenderedFeatures(
            [
              [
                e.point.x - interactionBufferSize / 2,
                e.point.y - interactionBufferSize / 2
              ],
              [
                e.point.x + interactionBufferSize / 2,
                e.point.y + interactionBufferSize / 2
              ]
            ],
            {
              layers: interactiveLayers
            }
          )

          if (features && features.length > 0) {
            if (selected) {
              clearSelection()
            }

            const feature = features[0]

            // find presets and add to props
            if (feature.layer && feature.layer.source) {
              let presets = MapStyles.settings.getSourceSetting(
                glStyle,
                feature.layer.source as string,
                'presets'
              )

              if (!presets) {
                debug.log(`presets not found in source ${feature.layer.source}`)
                const source = glStyle.sources[feature.layer.source as string]
                let data

                if (source) {
                  data = source.data
                }

                if (data) {
                  if (data.metadata) {
                    presets = data.metadata['maphubs:presets']

                    if (presets) {
                      debug.log(
                        `presets FOUND! for source ${feature.layer.source}`
                      )
                    } else {
                      debug.log(
                        `presets not found in data.metadata for source ${feature.layer.source}`
                      )
                    }
                  } else {
                    debug.log(
                      `data.metadata not found in source ${feature.layer.source}`
                    )
                  }
                } else {
                  debug.log(`data not found in source ${feature.layer.source}`)
                }
              }

              if (!feature.properties.maphubs_metadata) {
                feature.properties.maphubs_metadata = {}
              }

              if (typeof feature.properties.maphubs_metadata === 'string') {
                feature.properties.maphubs_metadata = JSON.parse(
                  feature.properties.maphubs_metadata
                )
              }

              if (!feature.properties.maphubs_metadata.presets) {
                feature.properties.maphubs_metadata.presets = presets
              }
            }

            if (editing) {
              if (
                feature.properties.layer_id &&
                editingLayer.layer_id === feature.properties.layer_id
              ) {
                dispatch(setClickedFeature({ feature }))
              }

              return // return here to disable interactation with other layers when editing
            }

            setSelectionFilter([feature])
            setSelected(true)
            setSelectedFeature(feature)
          } else if (selectedFeature) {
            clearSelection()
            $(mapRef.current)
              .find('.mapboxgl-canvas-container')
              .css('cursor', '')
          }
        }
      }
    }

    const createMap = async () => {
      // create the map
      debug.log(`(${id}) Creating MapboxGL Map`)
      mapboxgl.accessToken = mapboxAccessToken

      // initialize the base map
      const result = await dispatch(setBaseMapThunk(initialBaseMap)).unwrap()
      await dispatch(
        setBaseMapStyleThunk({ style: result.baseMapStyle, skipUpdate: true })
      )

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
        style: result.baseMapStyle,
        zoom: zoom || 0,
        minZoom: minZoom || 0,
        maxZoom: maxZoom || 22,
        interactive: interactionActive,
        dragRotate: !!enableRotation,
        touchZoomRotate: true,
        touchPitch: false,
        preserveDrawingBuffer,
        center: [0, 0],
        hash,
        attributionControl: false,
        transformRequest: (url: string, resourceType) => {
          if (map.authUrlStartsWith && url.startsWith(map.authUrlStartsWith)) {
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
        debug.log(`(${id}) MAP LOADED`)
        // add selector for screenshot tool
        setTimeout(() => {
          $('body').append(
            '<div id="map-load-complete" style="display: none;"></div>'
          )
        }, 5000)
      })
      map.on('style.load', () => {
        debug.log(`(${id}) style.load`)

        // restore map bounds (except for geoJSON maps)
        if (
          !data && // use bbox for GeoJSON data
          !mapLoaded && // only set map position on first style load (not after changing base map etc)
          fitBounds // bounds are provided in Props
        ) {
          let bounds = fitBounds as
            | [[number, number], [number, number]]
            | [number, number, number, number]

          if (bounds.length > 2) {
            // convert from GeoJSON bbox to Mapbox bounds format
            bounds = [
              [bounds[0] as number, bounds[1] as number],
              [bounds[2], bounds[3]]
            ]
          }

          debug.log(`(${id}) fitting map to bounds: ${bounds.toString()}`)
          map.fitBounds(fitBounds, fitBoundsOptions)
        }

        // add the omh data

        if (data) {
          initGeoJSON(data)
        }

        setMapLoaded(true) // must set this true, before disablng loading otherwise createMap is called twice
        setMapLoading(false)

        //! previously setOverlayStyle was called here after mapbox loaded

        dispatch(
          setOverlayStyleThunk({
            overlayStyle: initialGLStyle,
            optimizeLayers: allowLayerOrderOptimization
          })
        )

        if (onLoad) onLoad()
      })

      // end style.load

      map.on('mousemove', mousemoveHandler)
      map.on('moveend', moveendHandler)
      map.on('click', clickHandler)

      if (interactionActive) {
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
        const languageControl = new MapboxLanguage(locale)
        map.addControl(languageControl)
        languageControlRef.current = languageControl
      } catch (err) {
        console.error('failed to add langauge control')
        console.error(err)
      }

      if (disableScrollZoom) {
        map.scrollZoom.disable()
      }

      mapRef.current = map
      dispatch(initMap({ mapboxMap: map, interactiveLayers }))
    }
    let interactiveLayers: string[] = []
    if (initialGLStyle) {
      interactiveLayers = getInteractiveLayers(initialGLStyle)
    }

    if (!mapLoaded && !mapLoading) {
      console.log('CREATE MAP')
      setMapLoading(true)

      dispatch(setInteractiveLayers(interactiveLayers))
      createMap()
    } else if (!mapLoading) {
      /*
      debug.log(`(${id}) glstyle changing from props`)

      dispatch(
        setOverlayStyleThunk({
          overlayStyle: initialGLStyle,
          optimizeLayers: allowLayerOrderOptimization
        })
      )
      dispatch(setInteractiveLayers(interactiveLayers))
      */
    }
  }, [
    glStyle,
    initialGLStyle,
    allowLayerOrderOptimization,
    disableScrollZoom,
    showScale,
    showFullScreen,
    navPosition,
    id,
    locale,
    fitBounds,
    fitBoundsOptions,
    hash,
    data,
    zoom,
    minZoom,
    maxZoom,
    preserveDrawingBuffer,
    enableRotation,
    attributionControl,
    onLoad,
    interactionActive,
    mapLoaded,
    mapLoading,
    mapboxAccessToken,
    initialBaseMap,
    dispatch,
    enableMeasurementTools,
    editing,
    interactionBufferSize,
    selected,
    selectedFeature,
    editingLayer,
    initGeoJSON,
    clearSelection,
    t
  ])

  useEffect(() => {
    debug.log('glstyle changed')
  }, [glStyle])

  // handle interactive setting changed
  useEffect(() => {
    if (interactionActive && !interactive) {
      debug.log(`(${id}) enabling interaction`)
      // interactive is enabled but started disabled
      mapRef.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false
        }),
        navPosition
      )
      if (showFullScreen)
        mapRef.current.addControl(
          new mapboxgl.FullscreenControl({
            container: document.querySelector(`#${id}-fullscreen-wrapper`)
          }),
          navPosition
        )
      if (mapRef.current.dragPan) mapRef.current.dragPan.enable()
      if (mapRef.current.scrollZoom) mapRef.current.scrollZoom.enable()
      if (mapRef.current.doubleClickZoom)
        mapRef.current.doubleClickZoom.enable()
      if (mapRef.current.touchZoomRotate)
        mapRef.current.touchZoomRotate.enable()
    }
  }, [interactive, interactionActive, navPosition, showFullScreen, id])

  // handle locale change
  useEffect(() => {
    dispatch(changeLocale(locale))
    debug.log(`(${id}) changing map language to: ${locale}`)
    // TODO: change inset map locale

    try {
      if (
        (baseMap === 'default' ||
          baseMap === 'dark' ||
          baseMap === 'streets' ||
          baseMap === 'satellite-streets' ||
          baseMap === 'topo') &&
        languageControlRef.current
      ) {
        const glStyleUpdate = languageControlRef.current.setLanguage(
          glStyle,
          locale
        )
        // TODO: fix change map language, move to an async thunk
        //mapRef.current.setStyle(glStyle)
      }
    } catch (err) {
      debug.error(err)
    }
  }, [locale, glStyle, baseMap, id, dispatch])

  const zoomToData = (data: FeatureCollection) => {
    const bbox =
      data.bbox && Array.isArray(data.bbox) && data.bbox.length > 0
        ? (data.bbox as Array<number>)
        : _bbox(data)

    if (bbox) {
      let s = bbox[0]
      if (s < -175) s = -175
      let w = bbox[1]
      if (w < -85) w = -85
      let n = bbox[2]
      if (n > 175) n = 175
      let e = bbox[3]
      if (e > 85) e = 85
      const bounds = [
        [s, w],
        [n, e]
      ] as mapboxgl.LngLatBoundsLike
      mapRef.current.fitBounds(bounds, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 12
      })
    }
  }

  // update GeoJSON data from props
  useEffect(() => {
    if (data && mapRef.current) {
      const geoJSONData = mapRef.current.getSource(
        'omh-geojson'
      ) as mapboxgl.GeoJSONSource

      if (geoJSONData) {
        debug.log(`(${id}) update geoJSON data`)
        // update existing data
        geoJSONData.setData(data)
        zoomToData(data)
      } else if (geoJSONData === undefined && data) {
        // do nothing, still updating from the last prop change...
      } else {
        debug.log(`(${id}) init geoJSON data`)

        if (mapLoaded) {
          initGeoJSON(data)
        } else {
          debug.log(`(${id}) Skipping GeoJSON init, map not ready yet`)
        }
      }
    }
  }, [data, id, mapLoaded, initGeoJSON])

  // handle fitBounds prop change
  useEffect(() => {
    if (fitBounds && mapRef.current) {
      //TODO: previously we did a deep compare _isEqual here with prev prop
      debug.log(`(${id}) FIT BOUNDS CHANGING`)
      let bounds = fitBounds

      if (bounds.length > 2) {
        bounds = [
          [bounds[0] as number, bounds[1] as number],
          [bounds[2], bounds[3]]
        ]
      }

      debug.log(`(${id}) bounds: ${bounds.toString()}`)
      mapRef.current.fitBounds(bounds, fitBoundsOptions)

      // disable map postion from layers if user is now providing bounds
      if (allowLayersToMoveMap) {
        dispatch(setAllowLayersToMoveMap(false))
      }
    }
  }, [id, fitBounds, fitBoundsOptions, allowLayersToMoveMap, dispatch])

  useEffect(() => {
    return () => {
      if (mapRef.current) mapRef.current.remove()
      console.log('*******************MAPBOX GL UNMOUNTED')
    }
  }, [])

  const startInteractive = () => {
    setInteractionActive(true)

    if (!enableRotation) {
      mapRef.current.dragRotate.disable()
      mapRef.current.touchZoomRotate.disableRotation()
    }
  }
  const changeBaseMap = async (mapName: string) => {
    debug.log(`(${id}) changing basemap to: ${mapName}`)
    const result = await dispatch(setBaseMapThunk(mapName)).unwrap()
    await dispatch(
      setBaseMapStyleThunk({ style: result.baseMapStyle, skipUpdate: false })
    )
    dispatch(setAllowLayersToMoveMap(false))

    if (onChangeBaseMap) {
      onChangeBaseMap(mapName)
    }
  }

  const className = classNames('mode', 'map', 'active')

  if (selectedFeature) {
    // close any existing popups
    if (mapboxPopupRef.current?.isOpen()) {
      mapboxPopupRef.current.remove()
      mapboxPopupRef.current = undefined
    }

    const popupFeature =
      selectedFeature.geometry.type !== 'Point'
        ? (turfCentroid(selectedFeature) as Feature<Point>)
        : (selectedFeature as Feature<Point>)

    const el = document.createElement('div')
    el.className = 'maphubs-feature-popup'
    ReactDOM.render(
      <FeaturePopup
        features={[selectedFeature]}
        showButtons={showFeatureInfoEditButtons}
      />,
      el
    )
    mapboxPopupRef.current = new mapboxgl.Popup()
      .setLngLat(popupFeature.geometry.coordinates as mapboxgl.LngLatLike)
      .setDOMContent(el)
      .addTo(mapRef.current)
    mapboxPopupRef.current.on('close', clearSelection)
  } else if (mapboxPopupRef.current) {
    mapboxPopupRef.current.remove()
  }

  return (
    <div
      id={`${id}-fullscreen-wrapper`}
      className={className}
      style={{ height: '100%', width: '100%' }}
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
            show={interactionActive && mapLoaded}
            gpxLink={gpxLink}
            onChangeBaseMap={changeBaseMap}
          />
        )}
        {enableMeasurementTools && (
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
              <span>{measurementMessage}</span>
            </div>
            <MapToolButton
              top='260px'
              right='10px'
              icon='close'
              show
              color='#000'
              onClick={() => {
                dispatch(setEnableMeasurementTools(false))
              }}
              tooltipText={t('Exit Measurement')}
              tooltipPosition='left'
            />
          </div>
        )}
        {!interactionActive && showPlayButton && (
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
            width={70}
            height={19}
            src='https://cdn-maphubs.b-cdn.net/maphubs/assets/maphubs-logo-small.png'
            alt='MapHubs Logo'
          />
        )}
        {showSearch && (
          <MapSearchPanel
            show={interactionActive && mapLoaded}
            mapboxAccessToken={mapboxAccessToken}
          />
        )}
      </div>
    </div>
  )
}

MapHubsMap.defaultProps = {
  id: 'map',
  initialBaseMap: 'default',
  locale: 'en',
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
  interactionBufferSize: 10,
  hash: true,
  attributionControl: false,
  preserveDrawingBuffer: false,
  allowLayerOrderOptimization: true,
  fitBoundsOptions: {
    animate: false
  },
  mapConfig: {},
  insetConfig: {}
}

export default MapHubsMap
