// @flow
var Layer = require('../../models/layer');
var Hub = require('../../models/hub');
var Map = require('../../models/map');
var Image = require('../../models/image');
//var log = require('../../services/log.js');
//var debug = require('../../services/debug')('routes/hubs');
var Promise = require('bluebird');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

 
  app.post('/hub/:hubid/api/map/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var hub_id = req.params.hubid;
    var data = req.body;
    if(data && data.layers && data.style && data.basemap && data.position && data.map_id){
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          Map.updateMap(data.map_id, data.layers, data.style, data.basemap, data.position, data.title, user_id)
          .then(function(){
            res.status(200).send({success: true});
          }).catch(apiError(res, 500));
        }else{
          notAllowedError(res, 'map');
        }
      }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }
  });

  app.post('/hub/:hubid/api/map/delete', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var hub_id = req.params.hubid;
    var data = req.body;
    if(data && data.map_id){
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          Map.deleteMap(data.map_id)
          .then(function(){
            res.status(200).send({success: true});
          }).catch(apiError(res, 500));
        }else{
          notAllowedError(res, 'map');
        }
      }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }
  });

  //Hub Management
  app.post('/hub/:hubid/api/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var session_user_id = req.session.user.id;
    var data = req.body;
    if (data && data.hub_id) {
      Hub.allowedToModify(data.hub_id, session_user_id)
      .then(function(allowed){
        if(allowed){
          if(data.name) data.name = data.name.replace('&nbsp;', '');
          if(data.tagline) data.tagline = data.tagline.replace('&nbsp;', '');
          if(data.description) data.description = data.description.replace('&nbsp;', '');

          Hub.updateHub(data.hub_id, data.name, data.description, data.tagline, data.published, data.resources, data.about, session_user_id)
            .then(function(result) {
              if (result && result == 1) {
                var commands = [];
                if(data.style && data.basemap && data.layers && data.layers.length > 0){
                  commands.push(Map.saveHubMap(data.layers, data.style, data.basemap, data.position, data.hub_id, session_user_id));
                }
                if(data.logoImage){
                    commands.push(Image.setHubImage(data.hub_id, data.logoImage, data.logoImageInfo, 'logo'));
                }
                if(data.bannerImage){
                    commands.push(Image.setHubImage(data.hub_id, data.bannerImage, data.bannerImageInfo, 'banner'));
                }

                Promise.all(commands)
                .then(function(){
                  res.send({success: true});
                }).catch(apiError(res, 500));

              } else {
                res.send({
                  success: false,
                  error: "Failed to Save Hub"
                });
              }
            }).catch(apiError(res, 500));
        }else{
          notAllowedError(res, 'hub');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

    app.post('/hub/:hubid/api/setphoto', function(req, res) {

      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }

      var user_id = req.session.user.id;
      var data = req.body;

      if(data && data.hub_id && data.image){
        Hub.allowedToModify(data.hub_id, user_id)
        .then(function(allowed){
          if(allowed){
            Image.setHubImage(data.hub_id, data.image, data.info, data.type)
            .then(function(){
              res.status(200).send({success: true});
            });
          } else {
            res.status(401).send();
          }
        }).catch(apiError(res, 500));
      } else {
        apiDataError(res);
      }
    });

    app.get('/hub/:hubid/api/layers', function(req, res) {
      var hub_id = req.params.hubid;
      Layer.getHubLayers(hub_id)
      .then(function(layers){
        res.status(200).send({success: true, layers});
      }).catch(apiError(res, 500));
  });

  app.post('/hub/:hubid/api/savemap', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var session_user_id = req.session.user.id;
    var data = req.body;

    if(data && data.hub_id && data.layers && data.style && data.basemap && data.position ){
      Hub.allowedToModify(data.hub_id, session_user_id)
      .then(function(allowed){
        if(allowed){
            Map.saveHubMap(data.layers, data.style, data.basemap, data.position, data.hub_id, session_user_id)
            .then(function(){
              res.status(200).send({success: true});
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'hub');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }

  });

    app.post('/hub/:hubid/api/delete', function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;
      var data = req.body;
      if (data && data.hub_id) {
        Hub.allowedToModify(data.hub_id, user_id)
        .then(function(allowed){
          if(allowed){
            return Hub.deleteHub(data.hub_id)
              .then(function() {
                res.send({success: true});
              }).catch(apiError(res, 500));
            }else{
              res.status(401).send();
            }
        }).catch(apiError(res, 500));
      } else {
        apiDataError(res);
      }
    });

    app.post('/hub/:hubid/api/user/setlocale', function(req, res) {
      var data = req.body;
      if(data.locale){
        req.session.locale = data.locale;
        req.setLocale(data.locale);
      }
      res.status(200).send({success: true});

    });

};
