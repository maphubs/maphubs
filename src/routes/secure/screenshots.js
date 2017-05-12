// @flow
var Stats = require('../../models/stats');
var ScreenshotUtils = require('../../services/screenshot-utils');
var apiError = require('../../services/error-response').apiError;
var privateLayerCheck = require('../../services/private-layer-check').middleware;

module.exports = function(app: any) {

  app.get('/api/screenshot/layer/thumbnail/:layer_id.jpg', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    ScreenshotUtils.getLayerThumbnail(layer_id)
    .then((image) => {
      ScreenshotUtils.returnImage(image, 'image/jpeg', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/layer/image/:layer_id.png', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    ScreenshotUtils.getLayerImage(layer_id)
    .then((image) => {
      ScreenshotUtils.returnImage(image, 'image/png', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/:mapid.png', (req, res) => {
    var map_id = parseInt(req.params.mapid || '', 10);
    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
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
    .then((image) => {
      ScreenshotUtils.returnImage(image, 'image/png', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/thumbnail/:mapid.jpg', (req, res) => {
    var map_id = parseInt(req.params.mapid || '', 10);
    ScreenshotUtils.getMapThumbnail(map_id)
    .then((image) => {
      ScreenshotUtils.returnImage(image, 'image/jpeg', req, res);
    }).catch(apiError(res, 500));

  });


};
