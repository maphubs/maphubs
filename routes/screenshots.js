var Layer = require('../models/layer');
var Map = require('../models/map');
var Stats = require('../models/stats');
var Promise = require('bluebird');
var ScreenshotUtils = require('../services/screenshot-utils');


//var debug = require('../services/debug')('routes/screenshots');

var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {

  //create a map view that we will use to screenshot the layer
  app.get('/api/layer/:layerid/static/render/', function(req, res, next) {
    var layer_id = parseInt(req.params.layerid || '', 10);
    Layer.getLayerByID(layer_id).then(function(layer){
      var title = layer.name + ' - MapHubs';
        res.render('staticmap', {title, hideFeedback: true,
           props:{
             name: layer.name,
             layers: [layer],
             position: layer.preview_position,
             basemap: 'default',
             style: layer.style,
             showLegend: false,
             showLogo: false
           }, req
         });
    }).catch(nextError(next));
  });

  app.get('/api/map/:mapid/static/render/', function(req, res, next) {
    var map_id = parseInt(req.params.mapid || '', 10);
    Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id)
      ])
      .then(function(results){
        var map = results[0];
        var layers = results[1];
        var title = 'Map';
        if(map.title){
          title = map.title;
        }
        title += ' - MapHubs';
        res.render('staticmap', {title, hideFeedback: true,
           props:{
             name: map.title,
             layers,
             position: map.position,
             basemap: map.basemap,
             style: map.style
           }, req
         });
      }).catch(nextError(next));
  });

  app.get('/api/map/:mapid/static/render/thumbnail', function(req, res, next) {
    var map_id = parseInt(req.params.mapid || '', 10);
    Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id)
      ])
      .then(function(results){
        var map = results[0];
        var layers = results[1];
        var title = 'Map';
        if(map.title){
          title = map.title;
        }
        title += ' - MapHubs';
        res.render('staticmap', {title, hideFeedback: true,
           props:{
             name: map.title,
             layers,
             position: map.position,
             basemap: map.basemap,
             style: map.style,
             showLegend: false,
             showLogo: false
           }, req
         });
      }).catch(nextError(next));
  });




  app.get('/api/screenshot/layer/thumbnail/:layerid.jpg', function(req, res) {
    var layer_id = parseInt(req.params.layerid || '', 10);
    ScreenshotUtils.getLayerThumbnail(layer_id)
    .then(function(image){
      ScreenshotUtils.returnImage(image, req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/:mapid.png', function(req, res) {
    var map_id = parseInt(req.params.mapid || '', 10);
    var user_id = null;
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
      ScreenshotUtils.returnImage(image, req, res);
    }).catch(apiError(res, 500));

  });

  app.get('/api/screenshot/map/thumbnail/:mapid.jpg', function(req, res) {
    var map_id = parseInt(req.params.mapid || '', 10);
    ScreenshotUtils.getMapThumbnail(map_id)
    .then(function(image){
      ScreenshotUtils.returnImage(image, req, res);
    }).catch(apiError(res, 500));

  });


};
