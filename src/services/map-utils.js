// @flow
var Promise = require('bluebird');
var Map = require('../models/map');
var nextError = require('./error-response').nextError;
var urlUtil = require('../services/url-util');
var debug = require('./debug')('map-utils');
var Locales = require('../services/locales');
var local = require('../local');

module.exports = {
  completeEmbedMapRequest(req: any, res: any, next: any, map_id: number, isStatic: boolean, canEdit: boolean, interactive: boolean, shared: boolean){
    
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
    Map.getMapLayers(map_id, canEdit)
    ])
    .then((results) => {
      var map = results[0];
      var layers = results[1];
      var title = 'Map';
      var geoJSONUrl = req.query.geoJSON;
      var markerColor = '#FF0000';
      if(req.query.color){
        markerColor = '#' + req.query.color;
      }
      var overlayName = req.__('Locations');
      if(req.query.overlayName){
        overlayName = req.query.overlayName;
       }
      
      if(map.title){
        title = Locales.getLocaleStringObject(req.locale, map.title);
      }
      title += ' - ' + MAPHUBS_CONFIG.productName;
      
      var baseUrl = urlUtil.getBaseUrl();
      let imageUrl;
      if(shared && map.share_id){
        imageUrl = `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`;
      }else{
        imageUrl = `${baseUrl}/api/screenshot/map/${map.map_id}.png`;
      }

        return res.render('embedmap', {
          title,
          props:{
            map, 
            layers, 
            canEdit, 
            isStatic, 
            interactive, 
            geoJSONUrl, 
            markerColor, 
            overlayName,
            showLogo,
            showScale,
            insetMap: showInset,
            image: imageUrl
          },
          hideFeedback: true, req});
    }).catch(nextError(next));
  },

  completeUserMapRequest(req: any, res: any, next: any, map_id: number, canEdit: boolean, shared: boolean){
    debug.log('completeUserMapRequest');
    return Promise.all([
    Map.getMap(map_id),
    Map.getMapLayers(map_id, canEdit)
    ])
    .then((results) => {
      var map = results[0];
      var layers = results[1];
      var title = 'Map';
      if(map.title){
        title = Locales.getLocaleStringObject(req.locale, map.title);
      }
      title += ' - ' + MAPHUBS_CONFIG.productName;
      var baseUrl = urlUtil.getBaseUrl();

      let imageUrl;
      if(shared && map.share_id){
        imageUrl = `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`;
      }else{
        imageUrl = `${baseUrl}/api/screenshot/map/${map.map_id}.png`;
      }

      let showShareButtons = true;
      if(local.requireLogin && !shared){
        showShareButtons = false;
      }
      //inject into map config
      map.showShareButtons = showShareButtons;

        return res.render('usermap',
         {
           title: `${title} - ${MAPHUBS_CONFIG.productName}`,
           props:{map, layers, canEdit},
           hideFeedback: true,
           oembed: 'map',
           twitterCard: {
             title,
             description: req.__('View interactive map on ') + MAPHUBS_CONFIG.productName,
             image: imageUrl,
             imageWidth: 1200,
             imageHeight: 630,
             imageType: 'image/png'
           },
           req
         }
       );
    }).catch(nextError(next));
  }
};
