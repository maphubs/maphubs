// @flow
var knex = require('../../connection.js');
var Layer = require('../../models/layer');
var LayerData = require('../../models/layer-data');
var Group = require('../../models/group');
//var log = require('../../services/log');
var DataLoadUtils = require('../../services/data-load-utils');
var debug = require('../../services/debug')('routes/layers');
var layerViews = require('../../services/layer-views');
var urlUtil = require('../../services/url-util');

var PhotoAttachment = require('../../models/photo-attachment');
//var Tag = require('../../models/tag');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/api/layer/create/savedata/:id', csrfProtection, function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.id;
    var layer_id = parseInt(req.params.id || '', 10);

    Layer.allowedToModify(layer_id, user_id)
    .then(function(allowed){
      if(allowed){
        //note: transaction must return promises all the way down, or it won't commit
        return knex.transaction(function(trx) {
          return Layer.getLayerByID(layer_id, trx)
            .then(function(layer){
              return DataLoadUtils.loadTempData(layer_id, user_id, trx)
              .then(function(){
                return layerViews.createLayerViews(layer_id, layer.presets, trx)
                .then(function(){
                    debug('data load transaction complete');
                    res.status(200).send({success: true});
              });
            });
          });
        }).catch(apiError(res, 500));
      }else{
        notAllowedError(res, 'layer');
      }
    }).catch(apiError(res, 500));
  });

  app.post('/api/layer/create/empty/:id', csrfProtection, function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.id;
    var layer_id = parseInt(req.params.id || '', 10);

    Layer.allowedToModify(layer_id, user_id)
    .then(function(allowed){
      if(allowed){
        return knex.transaction(function(trx) {
          return Layer.getLayerByID(layer_id, trx)
            .then(function(layer){
                return layerViews.createLayerViews(layer_id, layer.presets, trx)
                .then(function(){
                    debug('init empty transaction complete');
                    res.status(200).send({success: true});
              });
          });
        }).catch(apiError(res, 500));
      }else{
        notAllowedError(res, 'layer');
      }
    }).catch(apiError(res, 500));
  });

  app.post('/api/layer/admin/:action', csrfProtection, function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var action = req.params.action;

    var data = req.body;
    if(data){
      var actionData = [];
      switch(action){
        case 'createLayer':
          if(!data.name || !data.description || !data.group_id || data.private === undefined){
            apiDataError(res);
            return;
          }
          actionData = [
            data.name,
            data.description,
            data.group_id,
            data.private
          ];
          break;
        case 'saveSettings':
          if(!data.layer_id){
            apiDataError(res);
            return;
          }
          actionData = [
            data.layer_id,
            data.name,
            data.description,
            data.group_id,
            data.private
          ];
        break;
        case 'saveDataSettings':
          if(!data.layer_id){
            apiDataError(res);
            return;
          }
          actionData = [
            data.layer_id,
            data.is_empty,
            data.empty_data_type,
            data.is_external,
            data.external_layer_type,
            data.external_layer_config
          ];
        break;
        case 'saveSource':
          if(!data.layer_id){
            apiDataError(res);
            return;
          }
          actionData = [
            data.layer_id,
            data.source,
            data.license
          ];
          break;
        case 'saveStyle':
          if(!data.layer_id || !data.style){
            apiDataError(res);
            return;
          }
        actionData = [
        data.layer_id,
        data.style,
        data.labels,
        data.legend_html,
        data.settings,
        data.preview_position
        ];
        break;
        case 'delete':
        if(!data.layer_id){
          apiDataError(res);
          return;
        }
        actionData = [
        data.layer_id,
        data.app = app
        ];
        break;
        case 'setComplete':
        if(!data.layer_id){
          apiDataError(res);
          return;
        }
        actionData = [
        data.layer_id
        ];
        break;
        default:
        res.status(400).send({success:false, error: 'Bad Request: not a valid option'});
        return;
      }
      actionData.push(user_id);
      if(action === 'createLayer'){
        //confirm user is allowed to add a layer to this group
        Group.allowedToModify(data.group_id, user_id)
        .then(function(allowed){
          if(allowed){
            return Layer[action](...actionData)
            .then(function(result){
              if(result){
                res.send({success:true, action, layer_id: result[0]});
              }else {
                res.send({success:false, error: "Failed to Create Layer"});
              }
            }).catch(apiError(res, 500));
          }else{
            notAllowedError(res, 'layer');
          }
        }).catch(apiError(res, 500));
      }else{
        Layer[action](...actionData)
        .then(function(result){
          if(result){
            res.send({success:true, action});
          }else {
            res.send({success:false, error: "Failed to Update Layer"});
          }
        }).catch(apiError(res, 500));
      }
    }else{
      apiDataError(res);
    }
  });

app.post('/api/layer/deletedata/:id', csrfProtection, function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()
      || !req.session || !req.session.user) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }

  var user_id = req.session.user.id;
  var layer_id = parseInt(req.params.id || '', 10);
  Layer.allowedToModify(layer_id, user_id)
  .then(function(allowed){
    if(allowed){
      DataLoadUtils.removeLayerData(layer_id)
      .then(function(){
        res.status(200).send({success: true});
      }).catch(apiError(res, 500));
    } else {
      notAllowedError(res, 'layer');
    }
  }).catch(apiError(res, 500));
});

app.post('/api/layer/presets/save', csrfProtection, function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }
  var user_id: number = req.session.user.id;

  var data = req.body;
  if(data && data.layer_id && data.presets && data.create !== undefined){
    knex.transaction(function(trx) {
    return Layer.allowedToModify(data.layer_id, user_id, trx)
    .then(function(allowed: boolean){
      if(allowed){
        return Layer.savePresets(data.layer_id, data.presets, user_id, data.create, trx)
        .then(function(){
          if(data.create){
              res.status(200).send({success: true});
          }else{
            //update layer views and timestamp
            return Layer.getLayerByID(data.layer_id, trx)
              .then(function(layer){
                return layerViews.replaceViews(data.layer_id, layer.presets, trx)
                .then(function(){
                  //Mark layer as updated (tells vector tile service to reload)
                  return trx('omh.layers').update(
                    {
                      updated_by_user_id: user_id,
                      last_updated: knex.raw('now()')
                    }
                  ).where({layer_id: data.layer_id})
                  .then(function(){
                    res.status(200).send({success: true});
                  });
                });
              });
            }
          });
      } else {
        notAllowedError(res, 'layer');
      }
    });
    }).catch(apiError(res, 500));
  }else{
    apiDataError(res);
  }
});

app.post('/api/layer/notes/save', csrfProtection, function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }
  var user_id = req.session.user.id;
  var data = req.body;
  if (data && data.layer_id && data.notes) {
    Layer.allowedToModify(data.layer_id, user_id)
    .then(function(allowed){
      if(allowed){
        Layer.saveLayerNote(data.layer_id, user_id, data.notes)
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


app.post('/api/layer/addphotopoint', csrfProtection, function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }
  var user_id = req.session.user.id;
  var data = req.body;
  if (data && data.layer_id && data.geoJSON && data.image && data.imageInfo) {
    Layer.allowedToModify(data.layer_id, user_id)
    .then(function(allowed){
      if(allowed){
        return knex.transaction(function(trx) {
          return LayerData.createFeature(data.layer_id, data.geoJSON, trx)
          .then(function(mhid: string){
              //get the mhid for the new feature
              debug('new mhid: ' + mhid);
              return PhotoAttachment.setPhotoAttachment(data.layer_id, mhid, data.image, data.imageInfo, user_id, trx)
                .then(function(photo_id) {
                  return Layer.getLayerByID(data.layer_id, trx)
                  .then(function(layer){
                    var baseUrl = urlUtil.getBaseUrl();
                    var photo_url = baseUrl + '/feature/photo/' + photo_id + '.jpg';
                    //add a tag to the feature
                    return LayerData.setStringTag(layer.layer_id, mhid, 'photo_url', photo_url, trx)                                   
                    .then(function(){
                      return PhotoAttachment.addPhotoUrlPreset(layer, user_id, trx)
                      .then(function(presets){
                          return layerViews.replaceViews(data.layer_id, presets, trx)
                        .then(function(){
                          res.send({success: true, photo_id, photo_url, mhid});
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

};
