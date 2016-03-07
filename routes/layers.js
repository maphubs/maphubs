/* @flow weak */
var knex = require('../connection.js');
var Layer = require('../models/layer');
var Group = require('../models/group');
var Stats = require('../models/stats');
var multer  = require('multer');
var shp2json = require('shp2json');
var shapefileFairy = require('shapefile-fairy');
var fs = require('fs');
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
var slug = require('slug');
var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;


module.exports = function(app) {



  //Views
  app.get('/layers', function(req, res, next) {


    Promise.all([
      Layer.getFeaturedLayers(),
      Layer.getRecentLayers()
    ])
      .then(function(results){
        var featuredLayers = results[0];
        var recentLayers = results[1];
        res.render('layers', {title: req.__('Layers') + ' - MapHubs', props: {featuredLayers, recentLayers}, req});
      }).catch(nextError(next));


  });

  app.get('/createlayer', login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;

    Group.getGroupsForUser(user_id)
    .then(function(result){
      res.render('createlayer', {title: req.__('Create Layer') + ' - MapHubs', props: {groups: result}, req});
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
        Layer.allowedToModify(layer_id, user_id)
      ])
      .then(function(results){
        var layer = results[0];
        var stats = results[1];
        var canEdit = results[2];
        res.render('layerinfo', {title: layer.name + ' - MapHubs', props: {layer, stats, canEdit}, req});

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
      res.render('layermap', {title: layer.name + ' - MapHubs', props: {layer}, req});
    }).catch(nextError(next));
  });

  app.get('/layer/admin/:id/*', login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    Promise.all([
      Layer.getLayerByID(layer_id),
      Group.getGroupsForUser(user_id)
    ])
      .then(function(results){
        var layer = results[0];
         var group_id = layer.owned_by_group_id;
         var groups = results[1];
          Group.getGroupRole(user_id, group_id)
            .then(function(result){
              if(result && result.length == 1 && result[0].role == 'Administrator'){
                res.render('layeradmin', {title: layer.name + ' - MapHubs', props: {layer, groups}, req});
              }else{
                res.redirect('/unauthorized');
              }
            }).catch(nextError(next));
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
        actionData = [
          data.name,
          data.description,
          data.group_id,
          data.published
        ];
        break;
        case 'saveSettings':
        actionData = [
          data.layer_id,
          data.name,
          data.description,
          data.group_id,
          data.published
        ];
        break;
        case 'saveDataSettings':
          actionData = [
            data.layer_id,
            data.is_external,
            data.external_layer_type,
            data.external_layer_config
          ];
        break;
        case 'saveSource':
        actionData = [
          data.layer_id,
          data.source,
          data.license
        ];
        break;
        case 'saveStyle':
        actionData = [
        data.layer_id,
        data.style,
        data.legend_html,
        data.preview_position
        ];
        break;
        case 'delete':
        actionData = [
        data.layer_id,
        data.app = app
        ];
        break;
        default:
        res.status(400).send({success:false, error: 'Bad Request: not a valid option'});
      }
      actionData.push(user_id);

      Layer[action](...actionData)
      .then(function(result){
        if(result){
          if(action === 'createLayer'){
            res.send({success:true, action, layer_id: result[0]});
          }else{
            res.send({success:true, action});
          }
        }else {
          res.send({success:false, error: "Failed to Update Layer"});
        }
      }).catch(apiError(res, 500));
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
           //validate
           shapefileFairy(req.file.path, function(result){
             debug('ShapefileFairy Result: ' + JSON.stringify(result));
             result.success = result.valid;
             if(result.valid){
               debug('Shapefile Validation Successful');
               //we can finish converting to geojson
               var fileStream = fs.createReadStream(req.file.path);
               var stream = shp2json(fileStream); //note: shp2json automatically transforms to EPSG:4326

               var data = '';
                 stream.on('data', function(chunk) {
                   data+=chunk;
                 });

               stream.on('end', function() {
                 let geoJSON = JSON.parse(data);
                 DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
                 .then(function(result){
                   //tell the client if we were successful
                   res.status(200).send(result);
                 }).catch(apiError(res, 500));
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




         } else if(_endsWith(req.file.originalname, '.geojson')
         || _endsWith(req.file.originalname, '.json')){
           debug('JSON File Detected');
           fs.readFile(req.file.path, 'utf8', function (err, data) {
             if (err) throw err;
               var geoJSON = JSON.parse(data);
               DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
               .then(function(result){
                 res.status(200).send(result);
               }).catch(apiError(res, 500));
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
            var fileStream = fs.createReadStream(path);
            var stream = shp2json(fileStream, {shapefileName: req.body.requestedShapefile}); //note: shp2json automatically transforms to EPSG:4326

            var data = '';
              stream.on('data', function(chunk) {
                data+=chunk;
              });

            stream.on('end', function() {
              let geoJSON = JSON.parse(data);
              DataLoadUtils.storeTempGeoJSON(geoJSON, path, req.body.layer_id, true)
              .then(function(result){
                res.status(200).send(result);
              }).catch(apiError(res, 500));
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

app.get('/api/layer/:id/tile.json', function(req, res) {

    var layer_id = parseInt(req.params.id || '', 10);
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);

    Layer.getLayerByID(layer_id)
    .then(function(layer){
      if(layer.is_external && layer.external_layer_config.type == 'raster'){
        var bounds = [-180, -180, 180, 180];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        var tileJSON = {
          attribution: layer.source,
          autoscale: true,
          bounds,
          center: [0, 0, 3],
          created: layer.last_updated,
          description: layer.description,
          filesize: 0,
          format: "png8:m=h:c=64",
          id: 'omh-' + layer.layer_id,
          maxzoom: 19,
          minzoom: 0,
          name: layer.name,
          private: false,
          scheme: "xyz",
          source: "",
          tilejson: "2.0.0",
          tiles: layer.external_layer_config.tiles,
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
        };
        res.status(200).send(tileJSON);
      }else {
        res.status(404).send("TileJSON not supported for this layer");
      }
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

app.get('/api/layer/presets/:id', function(req, res) {
  var layer_id = parseInt(req.params.id || '', 10);
  Presets.getIdEditorPresets(layer_id)
  .then(function(preset){
    res.status(200).send(preset);
  }).catch(apiError(res, 500));
});

};
