// @flow
var Layer = require('../../models/layer');
var Map = require('../../models/map');
var Promise = require('bluebird');
//var log = require('../../services/log');
//var debug = require('../../services/debug')('routes/screenshots-public');
var nextError = require('../../services/error-response').nextError;
var manetCheck = require('../../services/manet-check')(false,true);

module.exports = function(app: any) {
  //create a map view that we will use to screenshot the layer
  app.get('/api/layer/:layer_id/static/render/', manetCheck, function(req, res, next) {

    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getLayerByID(layer_id).then(function(layer){
    var title = layer.name + ' - ' + MAPHUBS_CONFIG.productName;
      res.render('staticmap', {title, hideFeedback: true, 
        disableGoogleAnalytics: true,
        props:{
          name: layer.name,
          layers: [layer],
          position: layer.preview_position,
          basemap: 'default',
          style: layer.style,
          showLegend: false,
          insetMap: false,
          showLogo: false
        }, req
      });
    }).catch(nextError(next));
  });

  app.get('/api/map/:mapid/static/render/', manetCheck, function(req, res, next) {
    var map_id = parseInt(req.params.mapid || '', 10);

    Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id, true)
      ])
      .then(function(results){
        var map = results[0];
        var layers = results[1];
        var title = 'Map';
        if(map.title){
          title = map.title;
        }
        title += ' - ' + MAPHUBS_CONFIG.productName;
        res.render('staticmap', {title, hideFeedback: true,
          disableGoogleAnalytics: true,
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

  app.get('/api/map/:mapid/static/render/thumbnail', manetCheck, function(req, res, next) {
    var map_id = parseInt(req.params.mapid || '', 10);
    Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id, true)
      ])
      .then(function(results){
        var map = results[0];
        var layers = results[1];
        var title = 'Map';
        if(map.title){
          title = map.title;
        }
        title += ' - ' + MAPHUBS_CONFIG.productName;
        res.render('staticmap', {title, hideFeedback: true,
          disableGoogleAnalytics: true,
           props:{
             name: map.title,
             layers,
             position: map.position,
             basemap: map.basemap,
             style: map.style,
             showLegend: false,
             insetMap: false,
             showLogo: false
           }, req
         });
      }).catch(nextError(next));
  });

};
