import MapStyles from '../components/Map/Styles'
import Reflux from 'reflux'
import Actions from '../actions/MapMakerActions'
import type { Layer } from '../types/layer'
import request from 'superagent'
import _findIndex from 'lodash.findindex'
import _reject from 'lodash.reject'
import _find from 'lodash.find'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { checkClientError } from '../services/client-error-response'
import { LocalizedString } from '../types/LocalizedString'

const debug = DebugService('stores/MapMakerStore')

export type MapMakerStoreState = {
  map_id?: number
  title?: LocalizedString
  mapLayers?: Array<Layer>
  mapStyle?: Record<string, any>
  position?: Record<string, any>
  settings?: Record<string, any>
  isPrivate?: boolean
  owned_by_group_id?: string
  basemap?: string
  editingLayer?: boolean
}
export default class MapMakerStore extends Reflux.Store {
  state: MapMakerStoreState
  listenables: any
  setState: any

  constructor() {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState(): MapMakerStoreState {
    return {
      map_id: -1,
      mapLayers: [],
      settings: {},
      mapStyle: {},
      position: {},
      isPrivate: false,
      basemap: 'default',
      editingLayer: false
    }
  }

  reset(): void {
    this.setState(this.getDefaultState())

    if (this.state.mapLayers) {
      this.updateMap(this.state.mapLayers)
    }
  }

  storeDidUpdate(): void {
    debug.log('store updated')
  }

  // listeners
  setMapLayers(mapLayers: Array<Layer>, update = true): void {
    if (update) {
      this.updateMap(mapLayers)
    } else {
      // treat as immutable and clone
      mapLayers = JSON.parse(JSON.stringify(mapLayers))
      this.setState({
        mapLayers
      })
    }
  }

  setMapId(map_id: number): void {
    this.setState({
      map_id
    })
  }

  setMapTitle(title: LocalizedString): void {
    for (const key of Object.keys(title)) {
      if (title[key]) {
        title[key] = title[key].trim()
      }
    }
    this.setState({
      title
    })
  }

  setPrivate(isPrivate: boolean): void {
    this.setState({
      isPrivate
    })
  }

  setOwnedByGroupId(group_id: string): void {
    this.setState({
      owned_by_group_id: group_id
    })
  }

  setMapPosition(position: Record<string, any>): void {
    // treat as immutable and clone
    position = JSON.parse(JSON.stringify(position))
    this.setState({
      position
    })
  }

  setMapBasemap(basemap: string): void {
    this.setState({
      basemap
    })
  }

  setSettings(settings: Record<string, any>): void {
    // treat as immutable and clone
    settings = JSON.parse(JSON.stringify(settings))
    this.setState({
      settings
    })
  }

  addToMap(layer: Layer): boolean {
    // check if the map already has this layer
    if (
      _find(this.state.mapLayers, {
        layer_id: layer.layer_id
      })
    ) {
      return false
    } else {
      // tell the map to make this layer visible
      layer.style = MapStyles.settings.set(layer.style, 'active', true)
      const layers = this.state.mapLayers

      if (layers) {
        layers.unshift(layer)
        this.updateMap(layers)
      }

      return true
    }
  }

  removeFromMap(layer: Layer): void {
    const layers = _reject(this.state.mapLayers, {
      layer_id: layer.layer_id
    })

    this.updateMap(layers)
  }

  toggleVisibility(layer_id: number, cb: (...args: Array<any>) => any): void {
    const mapLayers = this.state.mapLayers

    const index = _findIndex(mapLayers, {
      layer_id
    })

    if (mapLayers) {
      const layer = mapLayers[index]
      let active = MapStyles.settings.get(layer.style, 'active')

      if (active) {
        layer.style = MapStyles.settings.set(layer.style, 'active', false)
        active = false
      } else {
        layer.style = MapStyles.settings.set(layer.style, 'active', true)
        active = true
      }

      if (layer.style?.layers) {
        for (const styleLayer of layer.style.layers) {
          if (!styleLayer.layout) {
            styleLayer.layout = {}
          }

          styleLayer.layout.visibility = active ? 'visible' : 'none'
        }
      }

      this.updateMap(mapLayers)
    }

    cb()
  }

  updateLayerStyle(
    layer_id: number,
    style: Record<string, any>,
    labels: Record<string, any>,
    legend: string,
    cb: (...args: Array<any>) => any
  ): void {
    // treat as immutable and clone
    style = JSON.parse(JSON.stringify(style))
    labels = JSON.parse(JSON.stringify(labels))
    const layers = JSON.parse(JSON.stringify(this.state.mapLayers))

    const index = _findIndex(this.state.mapLayers, {
      layer_id
    })

    if (layers) {
      layers[index].style = style
      layers[index].labels = labels
      layers[index].legend_html = legend
      this.updateMap(layers)
      cb(layers[index])
    }
  }

  saveMap(
    title: LocalizedString,
    position: Record<string, any>,
    basemap: string,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    // treat as immutable and clone
    title = JSON.parse(JSON.stringify(title))
    position = JSON.parse(JSON.stringify(position))

    const _this = this

    // resave an existing map
    for (const key of Object.keys(title)) {
      title[key] = title[key].trim()
    }
    request
      .post('/api/map/save')
      .type('json')
      .accept('json')
      .send({
        map_id: this.state.map_id,
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        settings: this.state.settings,
        title,
        position,
        basemap,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.setState({
            title,
            position,
            basemap
          })

          cb()
        })
      })
  }

  createMap(
    title: LocalizedString,
    position: Record<string, any>,
    basemap: string,
    group_id: string,
    isPrivate: boolean,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    // treat as immutable and clone
    title = JSON.parse(JSON.stringify(title))
    position = JSON.parse(JSON.stringify(position))

    const _this = this

    for (const key of Object.keys(title)) {
      title[key] = title[key].trim()
    }
    request
      .post('/api/map/create')
      .type('json')
      .accept('json')
      .send({
        layers: this.state.mapLayers,
        style: this.state.mapStyle,
        settings: this.state.settings,
        title,
        group_id,
        position,
        basemap,
        private: isPrivate,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const map_id = res.body.map_id

          _this.setState({
            title,
            map_id,
            position,
            basemap,
            owned_by_group_id: group_id,
            isPrivate
          })

          cb()
        })
      })
  }

  // helpers
  updateMap(mapLayers: Array<Layer>, rebuild = true): void {
    // treat as immutable and clone
    mapLayers = JSON.parse(JSON.stringify(mapLayers))

    const mapStyle = rebuild
      ? this.buildMapStyle(mapLayers)
      : this.state.mapStyle

    this.setState({
      mapLayers,
      mapStyle
    })
  }

  buildMapStyle(layers: Array<Layer>): void {
    return MapStyles.style.buildMapStyle(layers)
  }

  startEditing(): void {
    this.setState({
      editingLayer: true
    })
  }

  stopEditing(): void {
    this.setState({
      editingLayer: false
    })
  }

  deleteMap(
    map_id: number,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    request
      .post('/api/map/delete')
      .type('json')
      .accept('json')
      .send({
        map_id,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          cb()
        })
      })
  }
}
