//@flow
import Reflux from 'reflux';
import Actions from '../actions/AddPhotoPointActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;
var dms2dec = require('dms2dec');
var moment = require('moment');
import type {GeoJSONObject} from 'geojson-flow';
import type {Layer} from './layer-store';

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

   constructor(){
      super();
      this.state = this.getDefaultState();
      this.listenables = Actions;
  }

  getDefaultState(): AddPhotoPointStoreState{
    return {
      layer: {},
      submitted: false,
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug('store updated');
  }

  setImage(data: any, info: any, cb: any){
    debug('set image');

    if(info && info.exif && info.exif['GPSLatitude']){

    var lat = info.exif['GPSLatitude'];
    var latRef = info.exif['GPSLatitudeRef'];
    var lon = info.exif['GPSLongitude'];
    var lonRef = info.exif['GPSLongitudeRef'];

    var geoJSON = {
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
    };

    var bbox = require('@turf/bbox')(geoJSON);
    debug(bbox);
    geoJSON.bbox = bbox;

    var properties = {};

    //add optional exif metadata
    if(info.exif['Make']){
     properties.photo_make = info.exif['Make'];
    }

    if(info.exif['Model']){
     properties.photo_model = info.exif['Model'];
    }

    if(info.exif['GPSAltitude']){
     properties.photo_gps_altitude = info.exif['GPSAltitude'];
    }

    if(info.exif['GPSDestBearing']){
     properties.photo_gps_bearing = info.exif['GPSDestBearing'];
    }

    if(info.exif['GPSDateStamp'] && info.exif['GPSTimeStamp']){
      var dateParts = info.exif['GPSDateStamp'].split(':');
      var year = dateParts[0];
      var month = dateParts[1];
      var day = dateParts[2];
      var time = info.exif['GPSTimeStamp'];
      var hour = time[0];
      var minute = time[1];
      var second = time[2];

      var timestamp = moment()
      .year(year).month(month).date(day)
      .hour(hour).minute(minute).second(second)
      .format();
      properties.photo_timestamp = timestamp;
    }

    geoJSON.features[0].properties = properties;

    this.setState({image: data, imageInfo: info, geoJSON});
    cb(null);
  }else{
    //image does not contain GPS Location
    cb('Photo Missing GPS Information');
  }
  }

  submit(fields: any, _csrf: any, cb: any){
    debug('submit photo point');
    var _this = this;

    //save fields into geoJSON
    if(this.state.geoJSON && 
      this.state.geoJSON.features && 
      Array.isArray( this.state.geoJSON.features) &&
      this.state.geoJSON.features.length > 0){
      let firstFeature: Object = this.state.geoJSON.features[0];
      if(firstFeature){
        Object.keys(fields).map((key) => {
            let val = fields[key];  
            if(firstFeature.properties){
              firstFeature.properties[key] = val;
            }                             
        });
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
          });
          _this.trigger(_this.state);
          cb();
      });
    });
  }
}