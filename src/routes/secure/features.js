// @flow
var Feature = require('../../models/feature');
var Layer = require('../../models/layer');
var LayerData = require('../../models/layer-data');
var PhotoAttachment = require('../../models/photo-attachment');
var SearchIndex = require('../../models/search-index');
var knex = require('../../connection.js');
var urlUtil = require('../../services/url-util');
var imageUtils = require('../../services/image-utils');
var layerViews = require('../../services/layer-views');
//var debug = require('../../services/debug')('routes/features');
var log = require('../../services/log');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});
var privateLayerCheck = require('../../services/private-layer-check');
var isAuthenticated = require('../../services/auth-check');

module.exports = function(app: any) {

  app.get('/feature/:layer_id/:id/*', csrfProtection, privateLayerCheck.middlewareView, async (req, res, next) => {

    const id = req.params.id;
    const layer_id = parseInt(req.params.layer_id || '', 10);

    let mhid;
    if(id.includes(':')){
      mhid = id;
    }else{
      mhid = `${layer_id}:${id}`;
    }

    var user_id: number = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }

    if(mhid && layer_id){
      try{
        const layer = await Layer.getLayerByID(layer_id);
        const featureResult = await Feature.getFeatureByID(mhid, layer.layer_id);
        const photos = await PhotoAttachment.getPhotoIdsForFeature(layer_id, mhid);
        const feature = featureResult.feature;
        let photo;
        if(photos && Array.isArray(photos)){
          photo = photos[0];
        }

        let notes;
        if(featureResult.notes && featureResult.notes.notes){
          notes = featureResult.notes.notes;
        }
        let featureName = "Feature";
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
            return res.render('featureinfo',
            {
              title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
              fontawesome: true,
              talkComments: true,
              props: {feature, notes, photo, layer, canEdit: false},
              req,
              cache: false
            });
          }else{
            const allowed = await Layer.allowedToModify(layer_id, user_id);
            if(allowed){
              return res.render('featureinfo',
              {
                title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
                fontawesome: true,
                talkComments: true,
                props: {feature, notes, photo, layer, canEdit: true}, req
              });
            }
            else{
              return res.render('featureinfo',
              {
                title: featureName + ' - ' + MAPHUBS_CONFIG.productName,
                fontawesome: true,
                talkComments: true,
                props: {feature, notes, photo, layer, canEdit: false},
                  req
                });
            }
        }
        
      }catch(err){nextError(next)(err);}
    }else{
      next(new Error('Missing Required Data'));
    }
  });

  app.get('/api/feature/json/:layer_id/:id/*', privateLayerCheck.middleware, async (req, res) => {

    const id = req.params.id;
    const layer_id = parseInt(req.params.layer_id || '', 10);

    let mhid;
    if(id.includes(':')){
      mhid = id;
    }else{
      mhid = `${layer_id}:${id}`;
    }

    if(mhid && layer_id){
      try{
        const geoJSON = await Feature.getGeoJSON(mhid, layer_id);
        const resultStr = JSON.stringify(geoJSON);
        const hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        const match = req.get('If-None-Match');
         /*eslint-disable security/detect-possible-timing-attacks */
        if(hash === match){
          res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'ETag': hash
          });
          res.end(resultStr);
        }
        return;
      }catch(err){apiError(res, 500)(err);}
    }else{
      apiDataError(res);
    }
  });

  app.get('/api/feature/gpx/:layer_id/:id/*', privateLayerCheck.middleware, async (req, res, next) => {

    var id = req.params.id;
    var layer_id = parseInt(req.params.layer_id || '', 10);

    var mhid = `${layer_id}:${id}`;

    if(mhid && layer_id){
      try{
        const layer = await Layer.getLayerByID(layer_id);
        const result = await Feature.getFeatureByID(mhid, layer.layer_id);

        const feature = result.feature;
        let geoJSON = feature.geojson;
        geoJSON.features[0].geometry.type = "LineString";
        var coordinates = geoJSON.features[0].geometry.coordinates[0][0];
        log.info(coordinates);
        var resultStr = JSON.stringify(geoJSON);
        log.info(resultStr);
        const hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        const match = req.get('If-None-Match');
        if(hash === match){
          return res.status(304).send();
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

          return res.end(gpx);
        }
      }catch(err){nextError(next)(err);}
    }else{
      next(new Error('Missing Required Data'));
    }
  });

  app.get('/feature/photo/:photo_id.jpg', async (req, res) => {
    var photo_id = req.params.photo_id;
    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    try{
      const layer = await Layer.getLayerForPhotoAttachment(photo_id);
      const allowed = await privateLayerCheck.check(layer.layer_id, user_id);
 
      if(allowed){
        const result = await PhotoAttachment.getPhotoAttachment(photo_id);
        return imageUtils.processImage(result.data, req, res);
      }else{
        log.warn('Unauthorized attempt to access layer: ' + layer.layer_id);
        throw new Error('Unauthorized');
      }
    }catch(err){apiError(res, 404)(err);}
  });

  app.post('/api/feature/notes/save', csrfProtection, isAuthenticated, async (req, res) => {
    const data = req.body;
    if (data && data.layer_id && data.mhid && data.notes) {
      try{
        const allowed = await Layer.allowedToModify(data.layer_id, req.user_id);
        if(allowed){
          return knex.transaction(async (trx) => {
            await Feature.saveFeatureNote(data.mhid, data.layer_id, req.user_id, data.notes, trx);
            await SearchIndex.updateFeature(data.layer_id, data.mhid, true, trx);
            return res.send({success: true});
          });
        }else {
          return notAllowedError(res, 'layer');
        }    
      }catch(err){apiError(res, 500)(err);}
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/feature/photo/add', csrfProtection, isAuthenticated, (req, res) => {
    const data = req.body;
    if (data && data.layer_id && data.mhid && data.image && data.info) {
      Layer.allowedToModify(data.layer_id, req.user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction( async (trx) => {
            //set will replace existing photo
            const photo_id = await PhotoAttachment.setPhotoAttachment(data.layer_id, data.mhid, data.image, data.info, req.alloweduser_id, trx);
            
            //add a tag to the feature and update the layer
            const layer = await Layer.getLayerByID(data.layer_id, trx);
            const baseUrl = urlUtil.getBaseUrl();
            const photo_url = baseUrl + '/feature/photo/' + photo_id + '.jpg';
            await LayerData.setStringTag(layer.layer_id, data.mhid, 'photo_url', photo_url, trx);
            const presets = await PhotoAttachment.addPhotoUrlPreset(layer, req.user_id, trx);
            await layerViews.replaceViews(data.layer_id, presets, trx);
            await Layer.setUpdated(data.layer_id, req.user_id, trx);
      
            return res.send({success: true, photo_id, photo_url});
          }).catch(apiError(res, 500));
        }else {
          return notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/feature/photo/delete', csrfProtection, isAuthenticated, async (req, res) => {
    const data = req.body;
    if (data && data.layer_id && data.mhid && data.photo_id) {
      Layer.allowedToModify(data.layer_id, req.user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction(async (trx) => {
            //set will replace existing photo
            await PhotoAttachment.deletePhotoAttachment(data.layer_id, data.mhid, data.photo_id, trx);
            const layer = await Layer.getLayerByID(data.layer_id, trx);
              
            //remove the photo URL from feature
            await LayerData.setStringTag(layer.layer_id, data.mhid, 'photo_url', null, trx);
            await layerViews.replaceViews(data.layer_id, layer.presets, trx);
            await Layer.setUpdated(data.layer_id, req.user_id, trx);
            return res.send({success: true});
          }).catch(apiError(res, 500));
        }else {
          return notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });
};