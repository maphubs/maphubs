/* @flow weak */
var Feature = require('../models/feature');
var Layer = require('../models/layer');
var PhotoAttachment = require('../models/photo-attachment');
var knex = require('../connection.js');
var Tag = require('../models/tag');
var local = require('../local');
var urlUtil = require('../services/url-util');
var imageUtils = require('../services/image-utils');
var Promise = require('bluebird');
var layerViews = require('../services/layer-views');

//var log = require('../services/log.js');
//var debug = require('../services/debug')('routes/features');

var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;


module.exports = function(app) {


  app.get('/feature/:layer_id/:osm_id/*', function(req, res, next) {

    var osm_id = parseInt(req.params.osm_id || '', 10);
    var layer_id = parseInt(req.params.layer_id || '', 10);

    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }

    if(osm_id && layer_id){
      Promise.all([
        Feature.getFeatureByID(osm_id, layer_id),
        PhotoAttachment.getPhotoIdsForFeature(layer_id, osm_id),
        Layer.getLayerByID(layer_id)
      ])
      .then(function(results){
        var feature = results[0].feature;
        //only supporting one photo per feature for now...
        var photos = results[1];
        var layer =  results[2];
        var photo = null;
        if(photos && Array.isArray(photos)){
          photo = photos[0];
        }
        var notes = null;
        if(results.notes && results.notes.notes){
          notes = results.notes.notes;
        }
        var featureName = "Feature";
        if(feature.geojson.features.length > 0 && feature.geojson.features[0].properties){
          var geoJSONProps = feature.geojson.features[0].properties;
          if(geoJSONProps.name) {
            featureName = geoJSONProps.name;
          }
        }
        feature.layer_id = layer_id;
        feature.osm_id = osm_id;

        if (!req.isAuthenticated || !req.isAuthenticated()) {
          res.render('featureinfo',
          {
            title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
            fontawesome: true,
            mapboxgl:true,
            props: {feature, notes, photo, canEdit: false},
             req
           });
        }else{
          Layer.allowedToModify(layer_id, user_id)
          .then(function(allowed){
            if(allowed){
              res.render('featureinfo',
              {
                title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
                fontawesome: true,
                mapboxgl:true,
                props: {feature, notes, photo, layer, canEdit: true}, req
              });
            }
            else{
              res.render('featureinfo',
              {
                title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
                fontawesome: true,
                mapboxgl:true,
                props: {feature, notes, photo, layer, canEdit: false},
                 req
               });
            }
        });
      }
      }).catch(nextError(next));
    }else{
      next(new Error('Missing Required Data'));
    }
  });

  app.get('/feature/photo/:photo_id.jpg', function(req, res) {
    var photo_id = req.params.photo_id;
    PhotoAttachment.getPhotoAttachment(photo_id)
    .then(function(result){
      imageUtils.processImage(result.data, req, res);
    }).catch(apiError(res, 404));

  });


  app.post('/api/feature/notes/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.osm_id && data.notes) {
      Layer.allowedToModify(data.layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          Feature.saveFeatureNote(data.osm_id, data.layer_id, user_id, data.notes)
            .then(function() {
              res.send({success: true});
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });


  app.post('/api/feature/photo/add', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.osm_id && data.image && data.info) {
      Layer.allowedToModify(data.layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          return knex.transaction(function(trx) {
            //set will replace existing photo
          return PhotoAttachment.setPhotoAttachment(data.layer_id, data.osm_id, data.image, data.info, user_id, trx)
            .then(function(photo_id) {
              return Layer.getLayerByID(data.layer_id, trx)
              .then(function(layer){
                var baseUrl = urlUtil.getBaseUrl(local.host, local.port);
                var photo_url = baseUrl + '/feature/photo/' + photo_id + '.jpg';
                //add a tag to the feature
                if(layer.data_type === 'point'){
                  return Tag.setNodeTag(data.osm_id, 'photo_url', photo_url, trx)
                  .then(function(){
                    return PhotoAttachment.addPhotoUrlPreset(layer, user_id, trx)
                    .then(function(presets){
                        return layerViews.replaceViews(data.layer_id, presets, trx)
                      .then(function(){
                        Layer.setUpdated(data.layer_id, user_id)
                        .then(function(){
                          res.send({success: true, photo_id, photo_url});
                        });
                      });
                    });
                  });
                }else if(layer.data_type === 'way'){
                  return Tag.setWayTag(data.osm_id, 'photo_url', photo_url, trx)
                  .then(function(){
                    return PhotoAttachment.addPhotoUrlPreset(layer, user_id, trx)
                    .then(function(presets){
                      return layerViews.replaceViews(data.layer_id, presets, trx)
                      .then(function(){
                        Layer.setUpdated(data.layer_id, user_id)
                        .then(function(){
                          res.send({success: true, photo_id, photo_url});
                        });
                      });
                    });
                  });
                }else if(layer.data_type === 'polygon'){
                  return Tag.setPolygonTag(data.layer_id, data.osm_id, 'photo_url', photo_url, trx)
                  .then(function(){
                    return PhotoAttachment.addPhotoUrlPreset(layer, user_id, trx)
                      .then(function(presets){
                        return layerViews.replaceViews(data.layer_id, presets, trx)
                        .then(function(){
                          Layer.setUpdated(data.layer_id, user_id)
                          .then(function(){
                            res.send({success: true, photo_id, photo_url});
                          });
                        });
                    });
                  });
                }
              });
            });
          }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/feature/photo/delete', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.osm_id && data.photo_id) {
      Layer.allowedToModify(data.layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          return knex.transaction(function(trx) {
            //set will replace existing photo
          return PhotoAttachment.deletePhotoAttachment(data.layer_id, data.osm_id, data.photo_id, trx)
            .then(function() {
              return Layer.getLayerByID(data.layer_id, trx)
              .then(function(layer){
                //remove tag from feature
                if(layer.data_type === 'point'){
                  return Tag.removeNodeTag(data.osm_id, 'photo_url', trx)
                  .then(function(){
                    return layerViews.replaceViews(data.layer_id, layer.presets, trx)
                    .then(function(){
                      Layer.setUpdated(data.layer_id, user_id)
                      .then(function(){
                        res.send({success: true});
                      });
                    });
                  });
                }else if(layer.data_type === 'way'){
                  return Tag.removeWayTag(data.osm_id, 'photo_url', trx)
                  .then(function(){
                    return layerViews.replaceViews(data.layer_id, layer.presets, trx)
                    .then(function(){
                      Layer.setUpdated(data.layer_id, user_id)
                      .then(function(){
                        res.send({success: true});
                      });
                    });
                  });
                }else if(layer.data_type === 'polygon'){
                  return Tag.removePolygonTag(data.layer_id, data.osm_id, 'photo_url', trx)
                  .then(function(){
                    return layerViews.replaceViews(data.layer_id, layer.presets, trx)
                    .then(function(){
                      Layer.setUpdated(data.layer_id, user_id)
                      .then(function(){
                        res.send({success: true});
                      });
                    });
                  });
                }
              });
            });
          }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });



};
