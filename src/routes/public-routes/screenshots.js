// @flow
var Layer = require('../../models/layer');
var Map = require('../../models/map');
var Promise = require('bluebird');
//var log = require('../../services/log');
//var debug = require('../../services/debug')('routes/screenshots-public');
var nextError = require('../../services/error-response').nextError;
var manetCheck = require('../../services/manet-check')();
var Locales = require('../../services/locales');

module.exports = function(app: any) {
  //create a map view that we will use to screenshot the layer
  app.get('/api/layer/:layer_id/static/render/', manetCheck, (req, res, next) => {

    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getLayerByID(layer_id).then((layer) => {
      let name = Locales.getLocaleStringObject(req.locale, layer.name);
      let title = name + ' - ' + MAPHUBS_CONFIG.productName;
      return res.render('staticmap', {title, hideFeedback: true, 
        disableGoogleAnalytics: true,
        props:{
          name,
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

  app.get('/api/map/:mapid/static/render/', manetCheck, (req, res, next) => {
    var map_id = parseInt(req.params.mapid || '', 10);

    let showLegend = true;
    if(req.query.hideLegend){
      showLegend = false;
    }

    let showLogo = true;
    if(req.query.hideLogo){
      showLogo = false;
    }

    let showScale = true;
    if(req.query.hideScale){
      showScale = false;
    }

    let showInset = true;
    if(req.query.hideInset){
      showInset = false;
    }

    Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id, true)
      ])
      .then((results) => {
        var map = results[0];
        var layers = results[1];
        var title = req.__('Map');
        if(map.title){
          title = Locales.getLocaleStringObject(req.locale, map.title);
        }
        return res.render('staticmap', {
          title: title + ' - ' + MAPHUBS_CONFIG.productName, 
          hideFeedback: true,
          disableGoogleAnalytics: true,
           props:{
             name: title,
             layers,
             position: map.position,
             basemap: map.basemap,
             style: map.style,
             settings: map.settings,
             showLegend,
             showLogo,
             showScale,
             insetMap: showInset
           }, req
         });
      }).catch(nextError(next));
  });

  app.get('/api/map/:mapid/static/render/thumbnail', manetCheck, (req, res, next) => {
    var map_id = parseInt(req.params.mapid || '', 10);
    Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id, true)
      ])
      .then((results) => {
        var map = results[0];
        var layers = results[1];
        var title = 'Map';
        if(map.title){
          title = Locales.getLocaleStringObject(req.locale, map.title);
        }
        return res.render('staticmap', {
          title: title + ' - ' + MAPHUBS_CONFIG.productName,
          hideFeedback: true,
          disableGoogleAnalytics: true,
           props:{
             name: title,
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
