// @flow
import _area from '@turf/area'
import turf_length from '@turf/length'
import {message} from 'antd'
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('Map/MeasureArea')
let MapboxDraw = {}
if (typeof window !== 'undefined') {
  MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js')
}

export default {

  toggleMeasurementTools (enable: boolean) {
    if (enable && !this.state.enableMeasurementTools) {
      // start
      this.startMeasurementTool()
    } else if (this.state.enableMeasurementTools && !enable) {
      // stop
      this.stopMeasurementTool()
    }
  },

  measureFeatureClick () {
    const map = this.map
    const _this = this

    const disableClick = function () {
      map.off('click', _this.onMeasureFeatureClick)
    }

    this.onMeasureFeatureClick = function (e) {
      e.originalEvent.stopPropagation()

      const features = map.queryRenderedFeatures(
        [
          [e.point.x - _this.props.interactionBufferSize / 2, e.point.y - _this.props.interactionBufferSize / 2],
          [e.point.x + _this.props.interactionBufferSize / 2, e.point.y + _this.props.interactionBufferSize / 2]
        ], {layers: _this.state.interactiveLayers})

      if (features && features.length > 0) {
        const feature = features[0]
        _this.setState({enableMeasurementTools: true})
        _this.updateMeasurement([feature])
        disableClick()
      }
    }

    map.on('click', this.onMeasureFeatureClick)
  },

  startMeasurementTool () {
    const {t} = this.props

    const containers: Array<Object> = this.props.containers
    const [, DataEditor] = containers

    if (DataEditor && DataEditor.state && DataEditor.state.editing) {
      message.warning(t('Please stop editing before enabling the measurement tool'), 3)
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
    this.draw = draw
    this.map.addControl(draw, 'top-right')

    this.map.on('draw.create', (e) => {
      debug.log('draw create')
      const data = this.draw.getAll()
      this.updateMeasurement(data.features)
    })

    this.map.on('draw.update', (e) => {
      debug.log('draw update')
      const data = this.draw.getAll()
      this.updateMeasurement(data.features)
    })

    this.map.on('draw.delete', () => {
      debug.log('draw delete')
      this.setState({measurementMessage: t('Use the drawing tools below')})
    })

    this.setState({enableMeasurementTools: true,
      measurementMessage: t('Use the drawing tools below')
    })
  },

  stopMeasurementTool () {
    this.map.removeControl(this.draw)
    this.setState({
      enableMeasurementTools: false,
      measurementMessage: ''
    })
  },

  updateMeasurement (features) {
    const {t} = this.props
    if (features.length > 0) {
      const lines = {
        'type': 'FeatureCollection',
        'features': []
      }
      const polygons = {
        'type': 'FeatureCollection',
        'features': []
      }
      features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          polygons.features.push(feature)
        } else if (feature.geometry.type === 'LineString') {
          lines.features.push(feature)
        }
      })
      if (polygons.features.length > 0) {
        const area = _area(polygons)
        // restrict to area to 2 decimal points
        const areaM2 = Math.round(area * 100) / 100
        const areaKM2 = area * 0.000001
        const areaHA = areaM2 / 10000.00

        let areaMessage = t('Total area: ')

        if (areaM2 < 1000) {
          areaMessage = areaMessage + areaM2.toLocaleString() + 'm2 '
        } else {
          areaMessage = areaMessage + areaKM2.toLocaleString() + 'km2 '
        }
        areaMessage = areaMessage + areaHA.toLocaleString() + 'ha'
        this.setState({measurementMessage: areaMessage})
      } else if (lines.features.length > 0) {
        let distanceKm = 0
        lines.features.forEach((linestring) => {
          distanceKm += turf_length(linestring, {units: 'kilometers'})
        })
        const distanceMiles = distanceKm * 0.621371
        const distanceMessage = 'Total distance: ' + distanceKm.toLocaleString() + 'km ' + distanceMiles.toLocaleString() + 'mi'
        this.setState({measurementMessage: distanceMessage})
      }
    }
  }
}
