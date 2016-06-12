/* @flow weak */
var Promise = require('bluebird');
var Map = require('../models/map');
var nextError = require('./error-response').nextError;
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var debug = require('./debug')('map-utils');

module.exports = {
  completeEmbedMapRequest(req, res, next, map_id, isStatic, canEdit){
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
        res.render('embedmap', {
          title, 
          props:{map, layers, canEdit, isStatic}, 
          hideFeedback: true, req});
    }).catch(nextError(next));
  },

  completeUserMapRequest(req, res, next, map_id, canEdit){
    debug('completeUserMapRequest');
    return Promise.all([
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
      var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
        res.render('usermap',
         {
           title,
           props:{map, layers, canEdit},
           hideFeedback: true,
           addthis: true,
           oembed: 'map',
           twitterCard: {
             title,
             description: 'View full map on MapHubs.com',
             image: baseUrl + '/api/screenshot/map/' + map.map_id + '.png'
           },
           req
         }
       );
    }).catch(nextError(next));
  }
};
