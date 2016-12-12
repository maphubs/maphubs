// @flow
var Stats = require('../../models/stats');
var ScreenshotUtils = require('../../services/screenshot-utils');
var apiError = require('../../services/error-response').apiError;

module.exports = function(app: any) {

  app.get('/api/screenshot/layer/thumbnail/:layerid.jpg', function(req, res) {
    var layer_id = parseInt(req.params.layerid || '', 10);
    ScreenshotUtils.getLayerThumbnail(layer_id)
    .then(function(image){
      ScreenshotUtils.returnImage(image, 'image/jpeg', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/layer/image/:layerid.png', function(req, res) {
    var layer_id = parseInt(req.params.layerid || '', 10);
    ScreenshotUtils.getLayerImage(layer_id)
    .then(function(image){
      ScreenshotUtils.returnImage(image, 'image/png', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/:mapid.png', function(req, res) {
    var map_id = parseInt(req.params.mapid || '', 10);
    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.id;
    }

    //record requests for the png as map views
    var session = req.session;
    if(!session.mapviews){
      session.mapviews = {};
    }
    if(!session.mapviews[map_id]){
      session.mapviews[map_id] = 1;
      Stats.addMapView(map_id, user_id).catch(apiError(res, 500));
    }else{
      var views = session.mapviews[map_id];

      session.mapviews[map_id] = views + 1;
    }

    session.views = (session.views || 0) + 1;

    ScreenshotUtils.getMapImage(map_id)
    .then(function(image){
      ScreenshotUtils.returnImage(image, 'image/png', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/thumbnail/:mapid.jpg', function(req, res) {
    var map_id = parseInt(req.params.mapid || '', 10);
    ScreenshotUtils.getMapThumbnail(map_id)
    .then(function(image){
      ScreenshotUtils.returnImage(image, 'image/jpeg', req, res);
    }).catch(apiError(res, 500));

  });


};
