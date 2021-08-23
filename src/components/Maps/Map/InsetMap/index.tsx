import React, { useRef, useState, useEffect } from 'react'
import _centroid from '@turf/centroid'
import MapToolButton from '../MapToolButton'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import DebugService from '../../lib/debug'
import mapboxgl from 'mapbox-gl'
import { FeatureCollection } from 'geojson'
import { useSelector } from '../../redux/hooks'
import { selectMapboxMap } from '../../redux/reducers/mapSlice'
import { selectBaseMapStyle } from '../../redux/reducers/baseMapSlice'

const debug = DebugService('map')

type Props = {
  id: string
  bottom: string
  collapsible: boolean
  collapsed?: boolean
  maxZoom: number
  padding: number
  minHeight: string
  maxHeight: string
  minWidth: string
  maxWidth: string
  height: string
  width: string
  fixedPosition?: {
    center: Array<number>
    zoom: number
  }
  mapboxAccessToken: string
}

const getGeoJSONFromBounds = (
  bounds: mapboxgl.LngLatBounds
): FeatureCollection => {
  const v1 = bounds.getNorthWest().toArray()
  const v2 = bounds.getNorthEast().toArray()
  const v3 = bounds.getSouthEast().toArray()
  const v4 = bounds.getSouthWest().toArray()
  const v5 = v1
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'bounds'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[v1, v2, v3, v4, v5]]
        }
      }
    ]
  }
}

const showInsetAsPoint = (zoom?: number) => {
  if (zoom && zoom > 9) {
    return true
  }
  return false
}

const InsetMap = (props: Props): JSX.Element => {
  const {
    fixedPosition,
    maxZoom,
    mapboxAccessToken,
    collapsible,
    padding,
    id,
    bottom,
    minHeight,
    maxHeight,
    minWidth,
    maxWidth,
    height,
    width
  } = props
  const insetMapRef = useRef(null)
  const [collapsed, setCollapsed] = useState(props.collapsed)
  const [loaded, setLoaded] = useState(false)
  const [insetGeoJSON, setInsetGeoJSON] = useState({
    insetGeoJSONData: {},
    insetGeoJSONCentroidData: {}
  })

  const mapboxMap = useSelector(selectMapboxMap)
  const baseMapStyle = useSelector(selectBaseMapStyle)

  useEffect(() => {
    const updateInsetGeomFromBounds = () => {
      const bounds = mapboxMap.getBounds()
      const zoom = mapboxMap.getZoom()
      const center = mapboxMap.getCenter()

      if (insetMapRef.current) {
        const insetGeoJSONData = insetMapRef.current.getSource('inset-bounds')
        const insetGeoJSONCentroidData =
          insetMapRef.current.getSource('inset-centroid')

        if (insetGeoJSONData || insetGeoJSONCentroidData) {
          try {
            const geoJSONBounds = getGeoJSONFromBounds(bounds)
            geoJSONBounds.features[0].properties = {
              v: 1
            }
            insetGeoJSONData.setData(geoJSONBounds)

            const geoJSONCentroid = _centroid(geoJSONBounds)

            geoJSONCentroid.properties = {
              v: 1
            }
            insetGeoJSONCentroidData.setData(geoJSONCentroid)
            setInsetGeoJSON({
              insetGeoJSONData,
              insetGeoJSONCentroidData
            })
            const config = {
              maxZoom: maxZoom,
              padding: padding,
              animate: false
            }

            if (zoom < 2.3) {
              insetMapRef.current.setFilter('center', ['==', 'v', 2])
              insetMapRef.current.setFilter('bounds', ['==', 'v', 2])
              insetMapRef.current.jumpTo(
                {
                  center
                },
                config
              )
            } else if (showInsetAsPoint(zoom)) {
              insetMapRef.current.setFilter('center', ['==', 'v', 1])
              insetMapRef.current.setFilter('bounds', ['==', 'v', 2])
              insetMapRef.current.fitBounds(
                [
                  [bounds.getWest(), bounds.getSouth()],
                  [bounds.getEast(), bounds.getNorth()]
                ],
                config
              )
            } else {
              insetMapRef.current.setFilter('center', ['==', 'v', 2])
              insetMapRef.current.setFilter('bounds', ['==', 'v', 1])
              insetMapRef.current.fitBounds(
                [
                  [bounds.getWest(), bounds.getSouth()],
                  [bounds.getEast(), bounds.getNorth()]
                ],
                config
              )
            }
          } catch (err) {
            debug.error(err)
          }
        }
      }
    }
    const updateInsetFixedPosition = () => {
      const bounds = mapboxMap.getBounds()

      if (insetMapRef.current) {
        const insetGeoJSONData = insetMapRef.current.getSource('inset-bounds')
        const insetGeoJSONCentroidData =
          insetMapRef.current.getSource('inset-centroid')

        if (insetGeoJSONData || insetGeoJSONCentroidData) {
          try {
            const geoJSONBounds = getGeoJSONFromBounds(bounds)
            geoJSONBounds.features[0].properties = {
              v: 1
            }
            insetGeoJSONData.setData(geoJSONBounds)

            const geoJSONCentroid = _centroid(geoJSONBounds)

            geoJSONCentroid.properties = {
              v: 1
            }
            insetGeoJSONCentroidData.setData(geoJSONCentroid)
            setInsetGeoJSON({
              insetGeoJSONData,
              insetGeoJSONCentroidData
            })
            const config = {
              maxZoom: maxZoom,
              padding: padding,
              animate: false
            }

            if (fixedPosition) {
              insetMapRef.current.jumpTo(
                {
                  center: fixedPosition.center
                },
                config
              )
              insetMapRef.current.zoomTo(fixedPosition.zoom)
            }
          } catch (err) {
            debug.error(err)
          }
        }
      }
    }
    const sync = () => {
      if (insetMapRef.current && fixedPosition) {
        updateInsetFixedPosition()
      } else {
        updateInsetGeomFromBounds()
      }
    }

    if (!loaded && mapboxMap) {
      const bounds = mapboxMap.getBounds()
      let center = mapboxMap.getCenter()

      if (fixedPosition && fixedPosition.center) {
        // ignore position info and use fixed
        center = fixedPosition.center
      }

      mapboxgl.accessToken = mapboxAccessToken
      const insetMap = new mapboxgl.Map({
        container: id + '_inset',
        style: baseMapStyle,
        zoom: 0,
        maxZoom: maxZoom,
        interactive: false,
        center,
        attributionControl: false
      })
      insetMapRef.current = insetMap
      insetMap.on('styledata', () => {
        // create geojson from bounds
        const insetGeoJSONData = insetMapRef.current.getSource('inset-bounds')

        if (!insetGeoJSONData) {
          // create layers
          const geoJSON = getGeoJSONFromBounds(bounds)

          geoJSON.features[0].properties = {
            v: 1
          }

          const geoJSONCentroid = _centroid(geoJSON)

          geoJSONCentroid.properties = {
            v: 1
          }
          insetMap.addSource('inset-bounds', {
            type: 'geojson',
            data: geoJSON
          })
          insetMap.addSource('inset-centroid', {
            type: 'geojson',
            data: geoJSONCentroid
          })
          insetMap.addLayer({
            id: 'bounds',
            type: 'line',
            source: 'inset-bounds',
            paint: {
              'line-color': 'rgb(244, 118, 144)',
              'line-opacity': 0.75,
              'line-width': 5
            }
          })
          insetMap.addLayer({
            id: 'center',
            type: 'circle',
            source: 'inset-centroid',
            paint: {
              'circle-color': 'rgb(244, 118, 144)',
              'circle-opacity': 0.75
            }
          })

          if (showInsetAsPoint()) {
            insetMap.setFilter('center', ['==', 'v', 1])
            insetMap.setFilter('bounds', ['==', 'v', 2])
          } else {
            insetMap.setFilter('center', ['==', 'v', 2])
            insetMap.setFilter('bounds', ['==', 'v', 1])
          }
        }
      })

      mapboxMap.on('move', () => {
        sync()
      })
      mapboxMap.on('load', () => {
        sync()
      })

      setLoaded(true)
    }
  }, [
    id,
    loaded,
    mapboxMap,
    baseMapStyle,
    fixedPosition,
    mapboxAccessToken,
    maxZoom,
    padding
  ])

  /*
  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.insetMap) {
      if (
        !this.insetMapActive ||
        (prevState.collapsed && !this.state.collapsed)
      ) {
        $(this.insetMapComponent).addClass('z-depth-1')
        $(this.insetMapComponent).css(
          'border',
          '0.5px solid rgba(222,222,222,50)'
        )
      }

      if (!this.insetMapActive) {
        this.insetMapActive = true
      }
    }
  }
  */

  useEffect(() => {
    if (insetMapRef.current) {
      insetMapRef.current.setStyle(baseMapStyle)
    }
  }, [baseMapStyle])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return collapsed ? (
    <div
      className='maphubs-inset'
      style={{
        position: 'absolute',
        bottom: bottom,
        left: '5px'
      }}
    >
      <div
        id={id + '_inset'}
        style={{
          display: 'none'
        }}
      >
        <MapToolButton
          onClick={toggleCollapsed}
          color='#323333'
          top='auto'
          right='auto'
          bottom='5px'
          left='5px'
          icon='near_me'
        />
      </div>
    </div>
  ) : (
    <div
      className='maphubs-inset'
      style={{
        position: 'absolute',
        bottom: bottom,
        left: '5px',
        minHeight: minHeight,
        maxHeight: maxHeight,
        minWidth: minWidth,
        maxWidth: maxWidth,
        height: height,
        width: width
      }}
    >
      <div
        id={id + '_inset'}
        className='map'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1
        }}
      />
      {collapsible && insetMapRef.current && (
        <ArrowDownward
          onClick={toggleCollapsed}
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            color: '#717171',
            cursor: 'pointer',
            textAlign: 'center',
            zIndex: 1,
            transform: 'rotate(45deg)',
            fontSize: '20px'
          }}
        />
      )}
    </div>
  )
}

InsetMap.defaultProps = {
  id: 'map',
  bottom: '30px',
  collapsible: true,
  maxZoom: 1.5,
  padding: 10,
  minHeight: '100px',
  maxHeight: '145px',
  minWidth: '100px',
  maxWidth: '145px',
  height: '25vw',
  width: '25vw'
}
export default InsetMap
