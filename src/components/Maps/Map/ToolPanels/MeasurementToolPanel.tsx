import React, { useRef, useEffect } from 'react'
import { Switch, Button } from 'antd'
import useMapT from '../../hooks/useMapT'
import { useSelector, useDispatch } from '../../redux/hooks'
import { selectMapboxMap } from '../../redux/reducers/mapSlice'
import _area from '@turf/area'
import turf_length from '@turf/length'
import { message } from 'antd'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import DebugService from '../../lib/debug'
import {
  setEnableMeasurementTools,
  setMeasurementMessage
} from '../../redux/reducers/mapSlice'

const debug = DebugService('Measure Tool')

type Props = {
  closePanel: () => void
}

const MeasurementToolPanel = ({ closePanel }: Props): JSX.Element => {
  const drawRef = useRef<MapboxDraw>()
  const { t } = useMapT()
  const dispatch = useDispatch()

  const mapboxMap = useSelector(selectMapboxMap)
  const enableMeasurementTools = useSelector(
    (state) => state.map.enableMeasurementTools
  )

  const interactiveLayers = useSelector((state) => state.map.interactiveLayers)
  const interactionBufferSize = useSelector(
    (state) => state.map.interactionBufferSize
  )
  const editing = useSelector((state) => state.dataEditor.editing)

  const prevEnabled = useRef<boolean>()
  useEffect(() => {
    if (prevEnabled.current && !enableMeasurementTools) {
      // measurement tools were toggled off
      mapboxMap.removeControl(drawRef.current)
      dispatch(setMeasurementMessage(''))
      prevEnabled.current = false
    } else {
      prevEnabled.current = enableMeasurementTools
    }
  }, [enableMeasurementTools, prevEnabled, mapboxMap, dispatch])

  const toggleMeasurementTools = (enable: boolean) => {
    if (enable && !enableMeasurementTools) {
      // start
      startMeasurementTool()
    } else if (enableMeasurementTools && !enable) {
      // stop, toggle will be detected by useEffect above
      dispatch(setEnableMeasurementTools(false))
    }
  }

  const measureFeatureClick = () => {
    const disableClick = function () {
      mapboxMap.off('click', onMeasureFeatureClick)
    }

    const onMeasureFeatureClick = function (e) {
      e.originalEvent.stopPropagation()
      const features = mapboxMap.queryRenderedFeatures(
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
        const feature = features[0]
        dispatch(setEnableMeasurementTools(true))

        updateMeasurement([feature])

        disableClick()
      }
    }

    mapboxMap.on('click', onMeasureFeatureClick)
  }

  const startMeasurementTool = () => {
    if (editing) {
      message.warning(
        t('Please stop editing before enabling the measurement tool'),
        3
      )
      return
    }

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true
      }
    })
    drawRef.current = draw
    mapboxMap.addControl(draw, 'top-right')
    mapboxMap.on('draw.create', (e) => {
      debug.log('draw create')
      if (drawRef.current) {
        const data = drawRef.current.getAll()
        updateMeasurement(data.features)
      }
    })
    mapboxMap.on('draw.update', (e) => {
      debug.log('draw update')
      if (drawRef.current) {
        const data = drawRef.current.getAll()
        updateMeasurement(data.features)
      }
    })
    mapboxMap.on('draw.delete', () => {
      debug.log('draw delete')
      dispatch(setMeasurementMessage(t('Use the drawing tools below')))
    })
    dispatch(setMeasurementMessage(t('Use the drawing tools below')))
    dispatch(setEnableMeasurementTools(true))
  }

  const updateMeasurement = (features: Array<Record<string, any>>) => {
    if (features.length > 0) {
      const lines = {
        type: 'FeatureCollection',
        features: []
      }
      const polygons = {
        type: 'FeatureCollection',
        features: []
      }
      for (const feature of features) {
        if (feature.geometry.type === 'Polygon') {
          polygons.features.push(feature)
        } else if (feature.geometry.type === 'LineString') {
          lines.features.push(feature)
        }
      }

      if (polygons.features.length > 0) {
        const area = _area(polygons)

        // restrict to area to 2 decimal points
        const areaM2 = Math.round(area * 100) / 100
        const areaKM2 = area * 0.000_001
        const areaHA = areaM2 / 10_000
        let areaMessage = t('Total area: ')

        areaMessage =
          areaM2 < 1000
            ? areaMessage + areaM2.toLocaleString() + 'm2 '
            : areaMessage + areaKM2.toLocaleString() + 'km2 '

        areaMessage = areaMessage + areaHA.toLocaleString() + 'ha'
        dispatch(setMeasurementMessage(areaMessage))
      } else if (lines.features.length > 0) {
        let distanceKm = 0
        for (const linestring of lines.features) {
          distanceKm += turf_length(linestring, {
            units: 'kilometers'
          })
        }
        const distanceMiles = distanceKm * 0.621_371
        const distanceMessage =
          'Total distance: ' +
          distanceKm.toLocaleString() +
          'km ' +
          distanceMiles.toLocaleString() +
          'mi'
        setMeasurementMessage(distanceMessage)
      }
    }
  }

  return (
    <div
      style={{
        textAlign: 'center'
      }}
    >
      <b>{t('Show Measurement Tools')}</b>
      <div>
        <Switch
          checked={enableMeasurementTools}
          onChange={(enableMeasurementTools: boolean) => {
            if (enableMeasurementTools) closePanel()
            toggleMeasurementTools(enableMeasurementTools)
          }}
        />
      </div>
      <div
        style={{
          marginTop: '20px'
        }}
      >
        <Button type='primary' onClick={measureFeatureClick}>
          {t('Select a Feature')}
        </Button>
      </div>
    </div>
  )
}
export default MeasurementToolPanel
