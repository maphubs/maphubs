// @flow
import MapStyles from '../components/Map/Styles'
import Reflux from 'reflux'
import Actions from '../actions/MapActions'
import type {Layer} from './layer-store'
const debug = require('../services/debug')('stores/map-store')
const findIndex = require('lodash.findindex')

export type MapStoreState = {
  style: Object,
  position: Object,
  layers: Array<Layer>
}

export default class MapStore extends Reflux.Store {
  state: MapStoreState

  constructor () {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState (): MapStoreState {
    return {
      style: {},
      position: {},
      layers: []
    }
  }

  reset () {
    this.setState(this.getDefaultState())
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  toggleVisibility (layer_id: number, cb: Function) {
    const mapLayers = this.state.layers
    const index = findIndex(mapLayers, {layer_id})
    let layer
    if (mapLayers) {
      layer = mapLayers[index]
      let active = MapStyles.settings.get(layer.style, 'active')

      if (active) {
        layer.style = MapStyles.settings.set(layer.style, 'active', false)
        active = false
      } else {
        layer.style = MapStyles.settings.set(layer.style, 'active', true)
        active = true
      }

      if (layer && layer.style && layer.style.layers) {
        layer.style.layers.forEach((styleLayer) => {
          if (!styleLayer.layout) {
            styleLayer.layout = {}
          }
          if (active) {
            styleLayer.layout.visibility = 'visible'
          } else {
            styleLayer.layout.visibility = 'none'
          }
        })
      }

      this.updateMap(mapLayers)
    }
    cb(layer.style)
  }

  updateLayers (layers: Array<Layer>, update: boolean = true) {
    this.setState({layers})
    if (update) {
      this.updateMap(layers)
    }
  }

  updateMap (layers: Array<Layer>) {
    // treat as immutable and clone
    layers = JSON.parse(JSON.stringify(layers))
    const style = this.buildMapStyle(layers)
    this.setState({layers, style})
  }

  buildMapStyle (layers: Array<Layer>) {
    return MapStyles.style.buildMapStyle(layers)
  }
}
