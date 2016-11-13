var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/FeatureNotesActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      feature: null,
      photo: null
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

  addPhoto(data, info, cb){
    debug('add feature photo');
    var _this = this;

    request.post('/api/feature/photo/add')
    .type('json').accept('json')
    .send({
      layer_id: this.state.feature.layer_id,
      osm_id: this.state.feature.osm_id,
      image: data,
      info
    })
    .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
          var feature = _this.state.feature;
          feature.hasImage = true;
          _this.setState({
            feature,
            photo: {
              photo_id: res.body.photo_id,
              photo_url: res.body.photo_url
            }
          });
          _this.trigger(_this.state);
          cb();
      });
    });
  },

  removePhoto(cb){
    debug('remove photo');
    var _this = this;

    request.post('/api/feature/photo/delete')
    .type('json').accept('json')
    .send({
      layer_id: this.state.feature.layer_id,
      osm_id: this.state.feature.osm_id,
      photo_id: this.state.photo.photo_id
    })
    .end(function(err, res){
       checkClientError(res, err, cb, function(cb){
          var feature = _this.state.feature;
          feature.hasImage = false;
          _this.setState({feature, photo: null});
          _this.trigger(_this.state);
          cb();
      });
    });
  }

});
