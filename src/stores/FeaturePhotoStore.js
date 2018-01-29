import Reflux from 'reflux'
import Actions from '../actions/FeaturePhotoActions'
const request = require('superagent')
const debug = require('../services/debug')('stores/hub-store')
const checkClientError = require('../services/client-error-response').checkClientError

export type FeaturePhotoStoreState = {
  feature: ?Object,
  photo: ?Object
}

export default class FeaturePhotoStore extends Reflux.Store {
state: FeaturePhotoStoreState

constructor () {
  super()
  this.state = {
    feature: null,
    photo: null
  }
  this.listenables = Actions
}

reset () {
  this.setState({
    feature: null,
    photo: null
  })
}

storeDidUpdate () {
  debug.log('store updated')
}

addPhoto (data, info, _csrf, cb) {
  debug.log('add feature photo')
  const _this = this

  request.post('/api/feature/photo/add')
    .type('json').accept('json')
    .send({
      layer_id: this.state.feature.layer_id,
      mhid: this.state.feature.mhid,
      image: data,
      info,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        const feature = _this.state.feature
        feature.hasImage = true
        _this.setState({
          feature,
          photo: {
            photo_id: res.body.photo_id,
            photo_url: res.body.photo_url
          }
        })
        _this.trigger(_this.state)
        cb()
      })
    })
}

removePhoto (_csrf, cb) {
  debug.log('remove photo')
  const _this = this

  request.post('/api/feature/photo/delete')
    .type('json').accept('json')
    .send({
      layer_id: this.state.feature.layer_id,
      mhid: this.state.feature.mhid,
      photo_id: this.state.photo.photo_id,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        const feature = _this.state.feature
        feature.hasImage = false
        _this.setState({feature, photo: null})
        _this.trigger(_this.state)
        cb()
      })
    })
}
}
