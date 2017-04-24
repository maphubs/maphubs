// @flow
var Feature = require('../../models/feature');
var Layer = require('../../models/layer');
var LayerData = require('../../models/layer-data');
var PhotoAttachment = require('../../models/photo-attachment');
var SearchIndex = require('../../models/search-index');
var knex = require('../../connection.js');
//var Tag = require('../../models/tag');
var urlUtil = require('../../services/url-util');
var imageUtils = require('../../services/image-utils');
var Promise = require('bluebird');
var layerViews = require('../../services/layer-views');
var debug = require('../../services/debug')('routes/features');
var log = require('../../services/log');
//var log = require('../../services/log.js');
//var debug = require('../../services/debug')('routes/features');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});
var privateLayerCheck = require('../../services/private-layer-check');

module.exports = function(app: any) {

  app.get('/feature/:layer_id/:id/*', csrfProtection, privateLayerCheck.middlewareView, (req, res, next) => {

    var id = req.params.id;
    var layer_id = parseInt(req.params.layer_id || '', 10);

    var mhid = `${layer_id}:${id}`;

    var user_id: number = -1;
    if(req.session.user){
      user_id = req.session.user.id;
    }

    if(mhid && layer_id){
        Layer.getLayerByID(layer_id)
        .then((layer) => {

      return Promise.all([
        Feature.getFeatureByID(mhid, layer.layer_id),
        PhotoAttachment.getPhotoIdsForFeature(layer_id, mhid),
      ])
      .then((results) => {
        var feature = results[0].feature;
        //only supporting one photo per feature for now...
        var photos = results[1];
        var photo = null;
        if(photos && Array.isArray(photos)){
          photo = photos[0];
        }
        var notes = null;
        if(results[0].notes && results[0].notes.notes){
          notes = results[0].notes.notes;
        }
        var featureName = "Feature";
        if(feature.geojson.features.length > 0 && feature.geojson.features[0].properties){
          var geoJSONProps = feature.geojson.features[0].properties;
          if(geoJSONProps.name) {
            featureName = geoJSONProps.name;
          }
          geoJSONProps.layer_id = layer_id;
          geoJSONProps.mhid = mhid;
        }
        feature.layer_id = layer_id;

        feature.mhid = mhid;


        if (!req.isAuthenticated || !req.isAuthenticated()) {
          res.render('featureinfo',
          {
            title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
            fontawesome: true,
            props: {feature, notes, photo, layer, canEdit: false},
             req
           });
        }else{
          Layer.allowedToModify(layer_id, user_id)
          .then((allowed) => {
            if(allowed){
              res.render('featureinfo',
              {
                title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
                fontawesome: true,
                props: {feature, notes, photo, layer, canEdit: true}, req
              });
            }
            else{
              res.render('featureinfo',
              {
                title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
                fontawesome: true,
                props: {feature, notes, photo, layer, canEdit: false},
                 req
               });
            }
        });
      }
      });
      }).catch(nextError(next));
    }else{
      next(new Error('Missing Required Data'));
    }
  });

  app.get('/api/feature/json/:layer_id/:id/*', privateLayerCheck.middleware, (req, res) => {

    var id = req.params.id;
    var layer_id = parseInt(req.params.layer_id || '', 10);

    var mhid = `${layer_id}:${id}`;

    if(mhid && layer_id){
       Feature.getGeoJSON(mhid, layer_id)
      .then((geoJSON) => {
        var resultStr = JSON.stringify(geoJSON);
        var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        var match = req.get('If-None-Match');
        if(hash == match){
          res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'ETag': hash
          });
          res.end(resultStr);
        }
        return;
      }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }
  });

  app.get('/api/feature/gpx/:layer_id/:id/*', privateLayerCheck.middleware, (req, res, next) => {

    var id = req.params.id;
    var layer_id = parseInt(req.params.layer_id || '', 10);

    var mhid = `${layer_id}:${id}`;

    if(mhid && layer_id){
        Layer.getLayerByID(layer_id)
        .then((layer) => {
          return Feature.getFeatureByID(mhid, layer.layer_id)
          .then((result) => {
            var feature = result.feature;
            var geoJSON = feature.geojson;
            geoJSON.features[0].geometry.type = "LineString";
            var coordinates = geoJSON.features[0].geometry.coordinates[0][0];
            log.info(coordinates);
            var resultStr = JSON.stringify(geoJSON);
            log.info(resultStr);
            var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
            var match = req.get('If-None-Match');
            if(hash == match){
              res.status(304).send();
            }else{
              res.writeHead(200, {
                'Content-Type': 'application/gpx+xml',
                'ETag': hash
              });

              var gpx = `
              <gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="MapHubs">
                <metadata>
                  <link href="https://maphubs.com">
                    <text>MapHubs</text>
                  </link>
                </metadata>
                <trk>
                  <name>Feature</name>
                  <trkseg>
                  `;
                  coordinates.forEach((coord) => {
                     gpx += ` <trkpt lon="${coord[0]}" lat="${coord[1]}"></trkpt>`;
                  });

                 gpx += `
                  </trkseg>
                </trk>
                </gpx>`;

              res.end(gpx);
            }
          });
          }).catch(nextError(next));
    }else{
      next(new Error('Missing Required Data'));
    }
  });

  app.get('/feature/photo/:photo_id.jpg', (req, res) => {
    var photo_id = req.params.photo_id;
    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }
    Layer.getLayerForPhotoAttachment(photo_id)
    .then((layer) => {
      return privateLayerCheck.check(layer.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return PhotoAttachment.getPhotoAttachment(photo_id)
          .then((result) => {
            imageUtils.processImage(result.data, req, res);
          });
        }else{
          log.warn('Unauthorized attempt to access layer: ' + layer.layer_id);
          throw new Error('Unauthorized');
        }
      });
    }).catch(apiError(res, 404));

  });

  app.post('/api/feature/notes/save', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.mhid && data.notes) {
      Layer.allowedToModify(data.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction((trx) => {
          return Feature.saveFeatureNote(data.mhid, data.layer_id, user_id, data.notes, trx)
          .then(()=>{
            return SearchIndex.updateFeature(data.layer_id, data.mhid, true, trx)
            .then(() => {
                res.send({success: true});
              });
          }).catch(apiError(res, 500));
        });
        }else {
          notAllowedError(res, 'layer');
        }
        
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });


  app.post('/api/feature/photo/add', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.mhid && data.image && data.info) {
      Layer.allowedToModify(data.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction((trx) => {
            //set will replace existing photo
          return PhotoAttachment.setPhotoAttachment(data.layer_id, data.mhid, data.image, data.info, user_id, trx)
            .then((photo_id) => {
              return Layer.getLayerByID(data.layer_id, trx)
              .then((layer) => {
                var baseUrl = urlUtil.getBaseUrl();
                var photo_url = baseUrl + '/feature/photo/' + photo_id + '.jpg';
                //add a tag to the feature
                return LayerData.setStringTag(layer.layer_id, data.mhid, 'photo_url', photo_url, trx)
                .then(() => {
                  debug('addPhotoUrlPreset');
                  return PhotoAttachment.addPhotoUrlPreset(layer, user_id, trx)
                  .then((presets) => {
                    debug('replaceViews');
                      return layerViews.replaceViews(data.layer_id, presets, trx)
                    .then(() => {
                      debug('Layer.setUpdated');
                      return Layer.setUpdated(data.layer_id, user_id, trx)
                      .then(() => {
                        return res.send({success: true, photo_id, photo_url});
                      });
                    });
                  });
                });
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

  app.post('/api/feature/photo/delete', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.mhid && data.photo_id) {
      
      Layer.allowedToModify(data.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction((trx) => {
            //set will replace existing photo
          return PhotoAttachment.deletePhotoAttachment(data.layer_id, data.mhid, data.photo_id, trx)
            .then(() => {
              return Layer.getLayerByID(data.layer_id, trx)
              .then((layer) => {
                //remove the photo URL from feature
                return LayerData.setStringTag(layer.layer_id, data.mhid, 'photo_url', null, trx)
                .then(() => {
                  return layerViews.replaceViews(data.layer_id, layer.presets, trx)
                  .then(() => {
                    return Layer.setUpdated(data.layer_id, user_id, trx)
                    .then(() => {
                      res.send({success: true});
                    });
                  });
                });
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
