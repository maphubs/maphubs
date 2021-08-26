import MapStyles from '../Map/Styles'
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

  // listeners

  saveMap(
    title: LocalizedString,
    position: Record<string, any>,
    basemap: string,
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
        basemap
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
        basemap
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const map_id = res.body.map_id

          _this.setState({
            title,
            map_id,
            position,
            basemap,
            owned_by_group_id: group_id
          })

          cb()
        })
      })
  }

  deleteMap(map_id: number, cb: (...args: Array<any>) => any): void {
    request
      .post('/api/map/delete')
      .type('json')
      .accept('json')
      .send({
        map_id
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          cb()
        })
      })
  }
}
