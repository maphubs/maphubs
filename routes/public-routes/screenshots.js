var Layer = require('../../models/layer');
var Map = require('../../models/map');
var Promise = require('bluebird');
var log = require('../../services/log');
var debug = require('../../services/debug')('routes/screenshots-public');

var nextError = require('../../services/error-response').nextError;

var local = require('../../local');
var manetCheck = function(req, res, next){
  if(local.requireLogin && (!req.isAuthenticated || !req.isAuthenticated())){
    //determine if this is the manet screenshot service
    let fail = false;
    if(req.headers['x-forwarded-for']){
      //valid requests won't come through a proxy!
      log.error('Unauthenticated screenshot request from a proxy');
      fail = true;
    }
    var ip = req.connection.remoteAddress;
    var manetUrl = local.manetUrl;
    var manetHost = require('url').parse(manetUrl).hostname;
    require('dns').lookup(manetHost, (err, addresses) => {
      debug('valid manet addresses:', addresses);
      if(!addresses.includes(ip)){
        log.error('Unauthenticated screenshot request, manet IP does not match');
        fail = true;
      }
      if(req.headers['manet-api-key'] !== local.manetAPIKey){
        log.error('Unauthenticated screenshot request, manet API key does not match');
        fail = true;
      }
    });
    if(fail){
      return res.status(401).send("Unauthorized");
    }else{
      next();
    }

  }else{
    next();
  }
};

module.exports = function(app) {
  //create a map view that we will use to screenshot the layer
  app.get('/api/layer/:layerid/static/render/', manetCheck, function(req, res, next) {

    //TODO: [Privacy] check that user is authorized to view this layer

    var layer_id = parseInt(req.params.layerid || '', 10);
    Layer.getLayerByID(layer_id).then(function(layer){
      var title = layer.name + ' - ' + MAPHUBS_CONFIG.productName;
        res.render('staticmap', {title, hideFeedback: true,
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
      Map.getMapLayers(map_id)
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
      Map.getMapLayers(map_id)
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
