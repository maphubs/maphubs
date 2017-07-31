// @flow
var ScreenshotUtils = require('../../services/screenshot-utils');
var apiError = require('../../services/error-response').apiError;
var privateLayerCheck = require('../../services/private-layer-check').middleware;

module.exports = function(app: any) {

  app.get('/api/screenshot/layer/thumbnail/:layer_id.jpg', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    ScreenshotUtils.getLayerThumbnail(layer_id)
    .then((image) => {
      return ScreenshotUtils.returnImage(image, 'image/jpeg', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/layer/image/:layer_id.png', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    ScreenshotUtils.getLayerImage(layer_id)
    .then((image) => {
      return ScreenshotUtils.returnImage(image, 'image/png', req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/:mapid.png', (req, res) => {
    var map_id = parseInt(req.params.mapid || '', 10);
   
    ScreenshotUtils.getMapImage(map_id)
    .then((image) => {
      return ScreenshotUtils.returnImage(image, 'image/png', req, res);
    }).catch(apiError(res, 500));
  });

  app.get('/api/screenshot/map/thumbnail/:mapid.jpg', (req, res) => {
    var map_id = parseInt(req.params.mapid || '', 10);
    ScreenshotUtils.getMapThumbnail(map_id)
    .then((image) => {
      return ScreenshotUtils.returnImage(image, 'image/jpeg', req, res);
    }).catch(apiError(res, 500));

  });


};
