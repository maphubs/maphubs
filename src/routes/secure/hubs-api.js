// @flow
var Hub = require('../../models/hub');
//var Map = require('../../models/map');
var Image = require('../../models/image');
//var log = require('../../services/log.js');
//var debug = require('../../services/debug')('routes/hubs');
var Promise = require('bluebird');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var login = require('connect-ensure-login');

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/api/hub/checkidavailable', login.ensureLoggedIn(), csrfProtection, (req, res, next) => {
    var data = req.body;
    if (data && data.id) {
      Hub.checkHubIdAvailable(data.id)
        .then((result) => {
          return res.send({
            available: result
          });
        }).catch(nextError(next));
    } else {
      res.status(400).send('Bad Request: required data not found');
    }
  });

  app.get('/api/hubs/search/suggestions', (req, res, next) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    var q = req.query.q;
    Hub.getSearchSuggestions(q)
      .then((result) => {
        var suggestions = [];
        result.forEach((hub) => {
          suggestions.push({key: hub.hub_id, value:hub.name});
        });
        return res.send({
          suggestions
        });
      }).catch(nextError(next));
  });

  app.get('/api/hubs/search', (req, res) => {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    Hub.getSearchResults(req.query.q)
      .then((result) => {
        return res.status(200).send({hubs: result});
      }).catch(apiError(res, 500));
  });

  app.post('/api/hub/create', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.hub_id && data.group_id && data.name ) {
      Hub.createHub(data.hub_id, data.group_id, data.name, data.published, data.private, user_id)
        .then((result) => {
          if (result) {
            return res.send({
              success: true
            });
          } else {
            return res.send({
              success: false,
              error: "Failed to Create Hub"
            });
          }
        }).catch(apiError(res, 500));
    } else {
      res.status(400).send({
        success: false,
        error: 'Bad Request: required data not found'
      });
    }
  });

  app.post('/hub/:hubid/api/save', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var session_user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.hub_id) {
      //TODO: wrap in transaction
      Hub.allowedToModify(data.hub_id, session_user_id)
      .then((allowed) => {
        if(allowed){
          if(data.name) data.name = data.name.replace('&nbsp;', '');
          if(data.tagline) data.tagline = data.tagline.replace('&nbsp;', '');
          if(data.description) data.description = data.description.replace('&nbsp;', '');

          return Hub.updateHub(data.hub_id, data.name, data.description, data.tagline, data.published, data.resources, data.about, data.map_id, session_user_id)
            .then((result) => {
              if(result && result === 1) {
                var commands = [];

                if(data.logoImage){
                    commands.push(Image.setHubImage(data.hub_id, data.logoImage, data.logoImageInfo, 'logo'));
                }
                if(data.bannerImage){
                    commands.push(Image.setHubImage(data.hub_id, data.bannerImage, data.bannerImageInfo, 'banner'));
                }

                return Promise.all(commands)
                .then(() => {
                  return res.send({success: true});
                }).catch(apiError(res, 500));

              } else {
                return res.send({
                  success: false,
                  error: "Failed to Save Hub"
                });
              }
            }).catch(apiError(res, 500));
        }else{
          return notAllowedError(res, 'hub');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });


  /**
   * change hub privacy settings
   */
  app.post('/hub/:hubid/api/privacy', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if(data && data.hub_id && data.isPrivate){
      Hub.allowedToModify(data.hub_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Hub.setPrivate(data.hub_id, data.isPrivate, data.user_id)
          .then(() => {
            return res.status(200).send({success: true});
          });
        }else{
          return notAllowedError(res, 'hub');
        }
      }).catch(apiError(res, 200));
    }else{
      apiDataError(res);
    }

  });

/* Not Used?
    app.get('/hub/:hubid/api/layers', function(req, res) {
      var hub_id = req.params.hubid;
      Layer.getHubLayers(hub_id, false)
      .then(function(layers){
        res.status(200).send({success: true, layers});
      }).catch(apiError(res, 500));
  });
  */

    app.post('/hub/:hubid/api/delete', csrfProtection, (req, res) => {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.maphubsUser.id;
      var data = req.body;
      if (data && data.hub_id) {
        Hub.allowedToModify(data.hub_id, user_id)
        .then((allowed) => {
          if(allowed){
            return Hub.deleteHub(data.hub_id)
              .then(() => {
                return res.send({success: true});
              }).catch(apiError(res, 500));
            }else{
              return res.status(401).send();
            }
        }).catch(apiError(res, 500));
      } else {
        apiDataError(res);
      }
    });
};
