/* @flow weak */
var knex = require('../connection.js');
var Layer = require('../models/layer');
var Group = require('../models/group');
var User = require('../models/user');
var Stats = require('../models/stats');
var multer  = require('multer');
var log = require('../services/log');
var ogr2ogr = require('ogr2ogr');
var shapefileFairy = require('shapefile-fairy');
var fs = require('fs');
var unzip = require('unzip2');
var Promise = require('bluebird');
var login = require('connect-ensure-login');
var DataLoadUtils = require('../services/data-load-utils');
var Presets = require('../services/preset-utils');
//var log = require('../services/log.js');
var debug = require('../services/debug')('routes/layers');
var layerViews = require('../services/layer-views');
//var globalViews = require('../services/global-views');
var _endsWith = require('lodash.endswith');
var local = require('../local');
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');


var geojson2osm = require('../services/geojson_to_macrocosm');
var Changeset = require('../services/changeset');
var PhotoAttachment = require('../models/photo-attachment');
var Tag = require('../models/tag');

var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;


module.exports = function(app) {



  //Views
  app.get('/layers', function(req, res, next) {


    Promise.all([
      Layer.getFeaturedLayers(),
      Layer.getRecentLayers(),
      Layer.getPopularLayers()
    ])
      .then(function(results){
        var featuredLayers = results[0];
        var recentLayers = results[1];
        var popularLayers = results[2];
        res.render('layers', {title: req.__('Layers') + ' - ' + config.productName, props: {featuredLayers, recentLayers, popularLayers}, req});
      }).catch(nextError(next));


  });

  app.get('/createlayer', login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;

    Group.getGroupsForUser(user_id)
    .then(function(result){
      res.render('createlayer', {title: req.__('Create Layer') + ' - ' + config.productName, props: {groups: result}, req});
    }).catch(nextError(next));

  });

  app.get('/layer/info/:id/*', function(req, res, next) {

    var layer_id = parseInt(req.params.id || '', 10);

    var user_id = null;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }

    if(!req.session.layerviews){
      req.session.layerviews = {};
    }
    if(!req.session.layerviews[layer_id]){
      req.session.layerviews[layer_id] = 1;
      Stats.addLayerView(layer_id,user_id).catch(nextError(next));
    }else{
      var views = req.session.layerviews[layer_id];

      req.session.layerviews[layer_id] = views + 1;
    }

    req.session.views = (req.session.views || 0) + 1;
      Promise.all([
        Layer.getLayerByID(layer_id),
        Stats.getLayerStats(layer_id),
        Layer.allowedToModify(layer_id, user_id),
        Layer.getLayerNotes(layer_id)
      ])
      .then(function(results){
        var layer = results[0];
        var stats = results[1];
        var canEdit = results[2];
        var notesObj = results[3];

        return Promise.all([
          User.getUser(layer.created_by_user_id),
          User.getUser(layer.updated_by_user_id)
        ])
        .then(function(userResults){
          var createdByUser = userResults[0];
          var updatedByUser = userResults[1];
          var notes = null;
          if(notesObj && notesObj.notes){
            notes = notesObj.notes;
          }

          if(layer){
          res.render('layerinfo', {title: layer.name + ' - ' + config.productName,
          props: {layer, notes, stats, canEdit, createdByUser, updatedByUser},
          fontawesome: true, req});
        }else{
          res.render('error', {
            title: req.__('Not Found'),
            props: {
              title: req.__('Not Found'),
              error: req.__('The page you request was not found'),
              url: req.url
            },
            req
          });
        }
      });
      }).catch(nextError(next));
  });

  app.get('/lyr/:layerid', function(req, res) {
    var layerid = req.params.layerid;
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    res.redirect(baseUrl + '/layer/info/' + layerid + '/');
  });

  app.get('/layer/map/:id/*', function(req, res, next) {

    var layer_id = parseInt(req.params.id || '', 10);

    Layer.getLayerByID(layer_id)
    .then(function(layer){
      res.render('layermap', {title: layer.name + ' - ' + config.productName, props: {layer}, hideFeedback: true, addthis: true, req});
    }).catch(nextError(next));
  });

  app.get('/layer/adddata/:id', login.ensureLoggedIn(), function(req, res, next) {

    var layer_id = parseInt(req.params.id || '', 10);
    var user_id = req.session.user.id;

    Layer.allowedToModify(layer_id, user_id)
      .then(function(allowed){
          return Layer.getLayerByID(layer_id)
          .then(function(layer){
            if(allowed || layer.allowPublicSubmission){ //placeholder for public submission flag on layers
              if(layer.data_type == 'point' && !layer.is_external){
                res.render('addphotopoint', {title: layer.name + ' - ' + config.productName, props: {layer}, req});
              }else{
                res.status(400).send('Bad Request: Feature not support for this layer');
              }
            }else{
              res.redirect('/unauthorized');
            }
          }).catch(nextError(next));
        }).catch(nextError(next));
  });

  app.get('/layer/admin/:id/*', login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    Layer.allowedToModify(layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          return Promise.all([
          Layer.getLayerByID(layer_id),
          Group.getGroupsForUser(user_id)
        ])
        .then(function(results){
          var layer = results[0];
          var groups = results[1];
          res.render('layeradmin', {title: layer.name + ' - ' + config.productName, props: {layer, groups}, req});
          });
        }else{
          res.redirect('/unauthorized');
        }
      }).catch(nextError(next));
  });


  //API Endpoints
  app.get('/api/layers/search/suggestions', function(req, res) {
    if(!req.query.q){
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
      return;
    }
    var q = req.query.q;
    Layer.getSearchSuggestions(q)
      .then(function(result){
        var suggestions = [];
          result.forEach(function(layer){
            suggestions.push({key: layer.layer_id, value:layer.name});
          });
          res.send({suggestions});
      }).catch(apiError(res, 500));
  });

  app.get('/api/layer/create/savedata/:id', function(req, res) {
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
              return DataLoadUtils.loadTempDataToOSM(layer_id, user_id, trx)
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

  app.get('/api/layer/create/empty/:id', function(req, res) {
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

  app.post('/api/layer/admin/:action', function(req, res) {
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
          if(!data.name || !data.description || !data.group_id || !data.published){
            apiDataError(res);
            return;
          }
          actionData = [
            data.name,
            data.description,
            data.group_id,
            data.published
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
            data.published
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


  app.post('/api/layer/:id/upload', multer({dest: local.tempFilePath + 'uploads/'}).single('file'),
   function (req, res) {
     if (!req.isAuthenticated || !req.isAuthenticated()
         || !req.session || !req.session.user) {
       res.status(401).send("Unauthorized, user not logged in");
     }

     var user_id = req.session.user.id;
     var layer_id = parseInt(req.params.id || '', 10);
     Layer.allowedToModify(layer_id, user_id)
     .then(function(allowed){
       if(allowed){
         debug('Mimetype: ' +req.file.mimetype);
         if(_endsWith(req.file.originalname, '.zip')){
           debug('Zip File Detected');
           fs.createReadStream(req.file.path).pipe(unzip.Extract({path: req.file.path + '_zip'}))
           .on('close', function(err){
              if (err) throw err;
             //validate
             shapefileFairy(req.file.path, function(result){
               debug('ShapefileFairy Result: ' + JSON.stringify(result));
               result.success = result.valid;

               if(result.valid){
                 debug('Shapefile Validation Successful');
                 var shpFilePath = req.file.path + '_zip/' + result.value.shp;
                 debug("shapefile: " + shpFilePath);
                  var ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(60000);
                  ogr.exec(function (er, geoJSON) {
                    if (er){
                      log.error(er);
                      res.status(200).send({success: false, error: er.toString()});
                    }else{
                      DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
                      .then(function(result){
                        //tell the client if we were successful
                        res.status(200).send(result);
                      }).catch(apiError(res, 500));
                    }
                  });
               }else{
                 debug('Shapefile Validation Error: ' + result.error);
                 DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
                 .then(function(){
                   debug('Finished storing temp path');
                   //tell the client if we were successful
                   res.status(200).send(result);
                 }).catch(apiError(res, 500));
               }
             },
             {extract: false});

          });


         } else if(_endsWith(req.file.originalname, '.geojson')
         || _endsWith(req.file.originalname, '.json')){
           debug('JSON File Detected');
           fs.readFile(req.file.path, 'utf8', function (err, data) {
             if (err) throw err;
               var geoJSON = JSON.parse(data);
               DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
               .then(function(result){
                 res.status(200).send(result);
               }).catch(apiError(res, 200)); //don't want browser to intercept the error, so we can show user a better message
           });
         } else {
           debug('Unsupported File Type: '+ req.file.path);
           res.status(200).send({success: false, valid: false, error: "Unsupported File Type"});
         }
       }else {
         notAllowedError(res, 'layer');
       }
     });



});

app.post('/api/layer/finishupload', function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()
      || !req.session || !req.session.user) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }

  var user_id = req.session.user.id;
  if(req.body.layer_id && req.body.requestedShapefile){
    debug('finish upload for layer: ' + req.body.layer_id + ' requesting shapefile: ' + req.body.requestedShapefile);
  Layer.allowedToModify(req.body.layer_id, user_id)
  .then(function(allowed){
    if(allowed){
      //get file path
      DataLoadUtils.getTempShapeUpload(req.body.layer_id)
      .then(function(path){
        debug("finishing upload with file: " + path);
        shapefileFairy(path, function(result){
          result.success = result.valid;
          result.error = result.msg;
          if(result.valid){
            var shpFilePath = path + '_zip' + '/' + req.body.requestedShapefile;
            var ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(60000);
            ogr.exec(function (er, geoJSON) {
              if (er){
                log.error(er);
                res.status(200).send({success: false, error: er.toString()});
              }else{
                DataLoadUtils.storeTempGeoJSON(geoJSON, path, req.body.layer_id, true)
                .then(function(result){
                  //tell the client if we were successful
                  res.status(200).send(result);
                }).catch(apiError(res, 500));
              }
            });
          }
        }, {shapefileName: req.body.requestedShapefile});
      });
    }else {
      notAllowedError(res, 'layer');
    }
  });
}else{
  apiDataError(res);
}

});

app.get('/api/layer/tempdata/:id.geojson', function(req, res) {
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
      DataLoadUtils.getTempData(layer_id)
      .then(function(result){
        res.status(200).send(result);
      }).catch(apiError(res, 500));
    } else {
      notAllowedError(res, 'layer');
    }
  }).catch(apiError(res, 500));
});

app.get('/api/layer/deletedata/:id', function(req, res) {
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

app.post('/api/layer/presets/save', function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }
  var user_id = req.session.user.id;

  var data = req.body;
  if(data && data.layer_id && data.presets && data.create !== undefined){
    knex.transaction(function(trx) {
    return Layer.allowedToModify(data.layer_id, user_id, trx)
    .then(function(allowed){
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

app.get('/api/layers/search', function(req, res) {
  if (!req.query.q) {
    res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    return;
  }
  Layer.getSearchResults(req.query.q)
    .then(function(result){
      res.status(200).send({layers: result});
    }).catch(apiError(res, 500));
});

app.get('/api/layers/all', function(req, res) {
  Layer.getAllLayers(true)
    .then(function(result){
      res.status(200).send({success: true, layers: result});
    }).catch(apiError(res, 500));
});

//layers recommend for this user (for use in user maps, etc.)
//TODO: actually filter this for the logged in user
app.get('/api/layers/recommended/user', function(req, res) {
  Layer.getAllLayers(true)
    .then(function(result){
      res.status(200).send({success: true, layers: result});
    }).catch(apiError(res, 500));
});

//layers recommend for this hub (for use in user maps, etc.)
//TODO: actually filter this for the hub
app.get('/api/layers/recommended/hub/:hubid', function(req, res) {
  Layer.getAllLayers(true)
    .then(function(result){
      res.status(200).send({success: true, layers: result});
    }).catch(apiError(res, 500));
});

app.get('/api/layer/info/:id', function(req, res) {
  var layer_id = parseInt(req.params.id || '', 10);
  Layer.getLayerInfo(layer_id)
  .then(function(layer){
    res.status(200).send({success: true, layer});
  }).catch(apiError(res, 500));
});

app.get('/api/layer/metadata/:id', function(req, res) {
  var layer_id = parseInt(req.params.id || '', 10);
  Layer.getLayerByID(layer_id)
  .then(function(layer){
    //inject this site's URL into the style source, to support remote layers
    Object.keys(layer.style.sources).forEach(function(key) {
      var source = layer.style.sources[key];
      source.url = source.url.replace('{MAPHUBS_DOMAIN}', config.tileServiceUrl);
    });
    res.status(200).send({success: true, layer});
  }).catch(apiError(res, 500));
});

app.get('/api/layer/presets/:id', function(req, res) {
  var layer_id = parseInt(req.params.id || '', 10);
  Presets.getIdEditorPresets(layer_id)
  .then(function(preset){
    res.status(200).send(preset);
  }).catch(apiError(res, 500));
});

app.post('/api/layer/notes/save', function(req, res) {
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

app.post('/api/layer/addphotopoint', function(req, res) {
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
          return Changeset.createChangeset(user_id, trx)
          .then(function(changeSetResult){
            var changeset_id = changeSetResult[0];
            debug('created changeset: ' + changeset_id);

            let osmJSON = geojson2osm(data.geoJSON, changeset_id, true, 0, 1);

            return Changeset.processChangeset(changeset_id, user_id, data.layer_id, osmJSON, trx)
            .then(function(processChangeSetResult){
              return Changeset.closeChangeset(changeset_id, trx)
              .then(function(){
                //get the osm_id for the feature
                debug(processChangeSetResult);
                var osm_id = processChangeSetResult.created.node['-1'];
                debug('osm_id:' + osm_id);
                return PhotoAttachment.setPhotoAttachment(data.layer_id, osm_id, data.image, data.imageInfo, user_id, trx)
                  .then(function(photo_id) {
                    return Layer.getLayerByID(data.layer_id, trx)
                    .then(function(layer){
                      var baseUrl = urlUtil.getBaseUrl(local.host, local.port);
                      var photo_url = baseUrl + '/feature/photo/' + photo_id + '.jpg';
                      //add a tag to the feature
                      return Tag.setNodeTag(osm_id, 'photo_url', photo_url, trx)
                      .then(function(){
                        return PhotoAttachment.addPhotoUrlPreset(layer, user_id, trx)
                        .then(function(presets){
                            return layerViews.replaceViews(data.layer_id, presets, trx)
                          .then(function(){
                            res.send({success: true, photo_id, photo_url, osm_id});
                          });
                        });
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
