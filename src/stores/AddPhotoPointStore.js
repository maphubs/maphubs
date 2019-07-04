// @flow
import Reflux from 'reflux'
import Actions from '../actions/AddPhotoPointActions'
import type {GeoJSONObject} from 'geojson-flow'
import type {Layer} from '../types/layer'
import _bbox from '@turf/bbox'

const request = require('superagent')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('stores/add-photo')
const checkClientError = require('../services/client-error-response').checkClientError
const dms2dec = require('dms2dec')
const moment = require('moment')

export type AddPhotoPointStoreState = {
  layer: Layer,
  image?: Object,
  imageInfo?: Object,
  geoJSON?: GeoJSONObject,
  submitted?: boolean,
  mhid?: string
}

export default class AddPhotoPointStore extends Reflux.Store {
  state: AddPhotoPointStoreState

  constructor () {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState (): AddPhotoPointStoreState {
    return {
      layer: {},
      submitted: false
    }
  }

  reset () {
    this.setState(this.getDefaultState())
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  setImage (data: any, info: any, cb: any) {
    debug.log('set image')

    if (info && info.exif && info.exif['GPSLatitude']) {
      const lat = info.exif['GPSLatitude']
      const latRef = info.exif['GPSLatitudeRef']
      const lon = info.exif['GPSLongitude']
      const lonRef = info.exif['GPSLongitudeRef']

      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: dms2dec(lat, latRef, lon, lonRef).reverse()
            },
            properties: {}
          }
        ],
        bbox: undefined
      }

      const bbox = _bbox(geoJSON)
      debug.log(bbox)
      geoJSON.bbox = bbox

      const properties = {}

      // add optional exif metadata
      if (info.exif['Make']) {
        properties.photo_make = info.exif['Make']
      }

      if (info.exif['Model']) {
        properties.photo_model = info.exif['Model']
      }

      if (info.exif['GPSAltitude']) {
        properties.photo_gps_altitude = info.exif['GPSAltitude']
      }

      if (info.exif['GPSDestBearing']) {
        properties.photo_gps_bearing = info.exif['GPSDestBearing']
      }

      if (info.exif['GPSDateStamp'] && info.exif['GPSTimeStamp']) {
        const dateParts = info.exif['GPSDateStamp'].split(':')
        const year = dateParts[0]
        const month = dateParts[1]
        const day = dateParts[2]
        const time = info.exif['GPSTimeStamp']
        const hour = time[0]
        const minute = time[1]
        const second = time[2]

        const timestamp = moment()
          .year(year).month(month).date(day)
          .hour(hour).minute(minute).second(second)
          .format()
        properties.photo_timestamp = timestamp
      }

      geoJSON.features[0].properties = properties

      this.setState({image: data, imageInfo: info, geoJSON})
      cb(null)
    } else {
    // image does not contain GPS Location
      cb(new Error('Photo Missing GPS Information'))
    }
  }

  submit (fields: any, _csrf: any, cb: any) {
    debug.log('submit photo point')
    const _this = this

    // save fields into geoJSON
    if (this.state.geoJSON &&
      this.state.geoJSON.features &&
      Array.isArray(this.state.geoJSON.features) &&
      this.state.geoJSON.features.length > 0) {
      const firstFeature: any = this.state.geoJSON.features[0]
      if (firstFeature) {
        Object.keys(fields).map((key) => {
          const val = fields[key]
          if (firstFeature.properties) {
            firstFeature.properties[key] = val
          }
        })
      }
    }

    request.post('/api/layer/addphotopoint')
      .type('json').accept('json')
      .send({
        layer_id: this.state.layer.layer_id,
        geoJSON: this.state.geoJSON,
        image: this.state.image,
        imageInfo: this.state.imageInfo,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.setState({
            mhid: res.body.mhid,
            image_id: res.body.image_id,
            image_url: res.body.image_url,
            submitted: true
          })
          _this.trigger(_this.state)
          cb()
        })
      })
  }
}
