import { Container } from 'unstated'
import turf_bbox from '@turf/bbox'
import turfBuffer from '../../../services/patched-turf-buffer'
import { getRemainingLayer } from '../Map/layer-remaining'
import { getGLADLayer } from '../Map/layer-glad'
import { getIFLLayer } from '../Map/layer-ifl'
import { getIFLLossLayer } from '../Map/layer-ifl-loss'
import { getLossLayer } from '../Map/layer-loss'
import StyleHelper from '../../Map/Styles/style'
import { getLayerFRActive } from '../Map/layer-feature'
import type { Layer } from '../../../types/layer'
type State = {
  featureLayer: Layer
  mapConfig?: Record<string, any>
  FRRemainingThreshold?: number
  mapLayers?: Array<Layer>
  glStyle?: Record<string, any>
  geoJSON?: Record<string, any>
  buffer: number
  isBuffered?: boolean
  pointGeom?: Record<string, any>
  bufferFeature?: Record<string, any>
}
export default class FRContainer extends Container<State> {
  constructor(initialState?: Record<string, any>) {
    super()
    const state = {
      featureLayer: {},
      buffer: 25
    }

    if (initialState) {
      Object.assign(state, initialState)
    }

    this.state = state
    this.changeBuffer(state.buffer)
  }

  changeBuffer: (buffer: number) => void = (buffer: number) => {
    const { geoJSON } = this.state
    let isBuffered
    let bufferFeature

    if (geoJSON) {
      const feature = geoJSON.features[0]
      const geom = feature.geometry

      if (
        geom.type === 'Point' ||
        geom.type === 'LineString' ||
        geom.type === 'MultiLineString'
      ) {
        isBuffered = true
        bufferFeature = turfBuffer(geom, buffer, {
          steps: 128
        })
      }

      this.setState({
        bufferFeature,
        isBuffered,
        buffer
      })
    }
  }
  activateFR: (config: any, mapComponent: any) => void = (
    config: Record<string, any>,
    mapComponent: Record<string, any>
  ) => {
    const { featureLayer, FRRemainingThreshold, bufferFeature } = this.state
    let combinedGLADFeatures = []
    config.glad.data.values.forEach((value) => {
      combinedGLADFeatures = combinedGLADFeatures.concat(value.features)
    })
    const gladGeoJSON = {
      type: 'FeatureCollection',
      features: combinedGLADFeatures
    }
    let ifl2016Data

    if (config.ifl2016 && config.ifl2016.features) {
      ifl2016Data = {
        type: 'FeatureCollection',
        features: config.ifl2016.features
      }
    }

    let iflLoss0013Data
    let iflLoss1316Data

    if (config.loss0013 && config.loss0013.features) {
      iflLoss0013Data = {
        type: 'FeatureCollection',
        features: config.loss0013.features
      }
    }

    if (config.loss1316 && config.loss1316.features) {
      iflLoss1316Data = {
        type: 'FeatureCollection',
        features: config.loss1316.features
      }
    }

    const mapLayers = [
      getGLADLayer(gladGeoJSON, config.toggles.glad),
      getIFLLossLayer(iflLoss0013Data, iflLoss1316Data, config.toggles.ifl),
      getIFLLayer(ifl2016Data, config.toggles.iflloss),
      getLayerFRActive(featureLayer, bufferFeature),
      getLossLayer(config.toggles.loss),
      getRemainingLayer(config.toggles.remaining, FRRemainingThreshold)
    ]
    const glStyle = StyleHelper.buildMapStyle(mapLayers)
    this.setState({
      mapLayers,
      glStyle
    })
    mapComponent.zoomToData(bufferFeature)
  }
  deactiveFR: () => void = () => {
    this.setState({
      mapLayers: [this.state.featureLayer]
    })
  }
  onAlertClick: (alert: any, mapComponent: any) => void = (
    alert: Record<string, any>,
    mapComponent: Record<string, any>
  ) => {
    // console.log(alert);
    const mapboxGL = mapComponent.map
    const geoJSONData = mapboxGL.getSource('fr-glad-geojson')
    const data = {
      type: 'FeatureCollection',
      features: alert.features
    }
    geoJSONData.setData(data)
    const bbox = turf_bbox(data)
    const bounds = [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]]
    ]
    mapboxGL.fitBounds(bounds, {
      padding: 25,
      curve: 3,
      speed: 0.6,
      maxZoom: 18
    })
  }
}