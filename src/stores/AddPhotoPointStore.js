//@flow
import Reflux from 'reflux';
import Actions from '../actions/AddPhotoPointActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;
var dms2dec = require('dms2dec');
var moment = require('moment');

export default class AddPhotoPointStore extends Reflux.Store {

   constructor(){
      super();
      this.state = this.getDefaultState();
      this.listenables = Actions;
  }

  getDefaultState(){
    return {
      layer: null,
      image: null,
      imageInfo: null,
      geoJSON: null,
      submitted: false,
      mhid: null
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
    var geoJSON = this.state.geoJSON;

    Object.keys(fields).map(function (key) {
         var val = fields[key];
         geoJSON.features[0].properties[key] = val;
     });

    request.post('/api/layer/addphotopoint')
    .type('json').accept('json')
    .send({
      layer_id: this.state.layer.layer_id,
      geoJSON: this.state.geoJSON,
      image: this.state.image,
      imageInfo: this.state.imageInfo,
      _csrf
    })
    .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
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