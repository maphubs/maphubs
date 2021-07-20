import Reflux from 'reflux'
import Actions from '../actions/FeaturePhotoActions'
import request from 'superagent'
import { checkClientError } from '../services/client-error-response'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('stores/feature-photo')

export type FeaturePhotoStoreState = {
  feature: Record<string, any> | null | undefined
  photo: Record<string, any> | null | undefined
}
export default class FeaturePhotoStore extends Reflux.Store {
  state: FeaturePhotoStoreState
  listenables
  any

  constructor() {
    super()
    this.state = {
      feature: null,
      photo: null
    }
    this.listenables = Actions
  }

  reset(): void {
    this.setState({
      feature: null,
      photo: null
    })
  }

  storeDidUpdate() {
    debug.log('store updated')
  }

  addPhoto(data, info, cb): void {
    debug.log('add feature photo')

    const _this = this

    request
      .post('/api/feature/photo/add')
      .type('json')
      .accept('json')
      .send({
        layer_id: this.state.feature.layer_id,
        mhid: this.state.feature.mhid,
        image: data,
        info
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const feature = _this.state.feature
          feature.hasImage = true

          _this.setState({
            feature,
            photo: {
              photo_url: res.body.photo_url
            }
          })

          _this.trigger(_this.state)

          cb()
        })
      })
  }

  removePhoto(cb): void {
    debug.log('remove photo')

    const _this = this

    request
      .post('/api/feature/photo/delete')
      .type('json')
      .accept('json')
      .send({
        layer_id: this.state.feature.layer_id,
        mhid: this.state.feature.mhid
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const feature = _this.state.feature
          feature.hasImage = false

          _this.setState({
            feature,
            photo: null
          })

          _this.trigger(_this.state)

          cb()
        })
      })
  }
}
