// @flow
var Layer = require('../../models/layer');
//var log = require('../../services/log');
//var debug = require('../../services/debug')('routes/layers');
var urlUtil = require('../../services/url-util');
var apiError = require('../../services/error-response').apiError;
var privateLayerCheck = require('../../services/private-layer-check').middleware;
var Locales = require('../../services/locales');
//Layer API Endpoints that do not require authentication

module.exports = function(app: any) {

  app.get('/api/layers/search/suggestions', (req, res) => {
    if(!req.query.q){
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
      return;
    }
    var q = req.query.q;
    Layer.getSearchSuggestions(q)
      .then((result) => {
        var suggestions = [];
          result.forEach((layer) => {
            let name = Locales.getLocaleStringObject(req.locale, layer.name);
            suggestions.push({key: layer.layer_id, value:name});
          });
          return res.send({suggestions});
      }).catch(apiError(res, 500));
  });

  app.get('/api/layers/search', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
      return;
    }
    let user_id;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    Layer.getSearchResults(req.query.q)
      .then(async (layers) => {
        if(user_id){
          await Layer.attachPermissionsToLayers(layers, user_id);
        }
        return res.status(200).send({layers});
      }).catch(apiError(res, 500));
  });


  app.get('/api/layer/info/:layer_id', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getLayerInfo(layer_id)
    .then((layer) => {
      return res.status(200).send({success: true, layer});
    }).catch(apiError(res, 500));
  });

  app.get('/api/layer/metadata/:layer_id', privateLayerCheck, (req, res) => {
    var layer_id = parseInt(req.params.layer_id || '', 10);
    Layer.getLayerByID(layer_id)
    .then((layer) => {
      //inject this site's URL into the style source, to support remote layers
      Object.keys(layer.style.sources).forEach((key) => {
        var source = layer.style.sources[key];
        if(source.url){
          source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
        }
        
      });
      return res.status(200).send({success: true, layer});
    }).catch(apiError(res, 500));
  });

};
