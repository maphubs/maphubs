/* @flow weak */
var express = require('express');
var local = require('../../local');
var Layer = require('../../models/layer');
var Story = require('../../models/story');
var Hub = require('../../models/hub');
var User = require('../../models/user');
var Map = require('../../models/map');
var Image = require('../../models/image');
var Stats = require('../../models/stats');
var Email = require('../../services/email-util');
//var path = require('path');
var login = require('connect-ensure-login');
//var log = require('../../services/log.js');
var debug = require('../../services/debug')('routes/hubs');
var Promise = require('bluebird');
var MapUtils = require('../../services/map-utils');
var knex = require('../../connection.js');

var urlUtil = require('../../services/url-util');
var baseUrl = urlUtil.getBaseUrl();
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app) {

  //API Endpoints
  app.post('/hub/:hubid/api/hub/story/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.title && data.author && data.body) {
      data.title = data.title.replace('&nbsp;', '');
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
          Story.updateStory(data.story_id, data.title, data.body, data.author, data.firstline, data.firstimage)
            .then(function(result) {
              if (result && result == 1) {
                res.send({
                  success: true
                });
              } else {
                res.send({
                  success: false,
                  error: "Failed to Save Story"
                });
              }
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'story');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.post('/hub/:hubid/api/story/delete', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id) {
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
          return knex.transaction(function(trx) {
            return Image.removeAllStoryImages(data.story_id, trx)
              .then(function() {
                return Story.delete(data.story_id, trx)
                  .then(function() {
                    res.send({
                      success: true
                    });
                });
              });
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'story');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.post('/hub/:hubid/api/hub/story/create', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var hub_id = req.params.hubid;
    var data = req.body;
    if (data && data.title && data.body && data.author) {
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          Story.createHubStory(hub_id, data.title, data.body, data.author, data.firstline, data.firstimage)
            .then(function(result) {
              if (result && result.length == 1) {
                res.send({
                  success: true,
                  story_id: result[0]
                });
              } else {
                res.send({
                  success: false,
                  error: "Failed to Create Story"
                });
              }
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'hub');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });


  app.post('/hub/:hubid/api/story/removeimage', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.image_id) {
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
          Image.removeStoryImage(data.story_id, data.image_id)
            .then(function() {
              res.send({
                success: true
              });
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'story');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.post('/hub/:hubid/api/map/create/storymap', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;

    var data = req.body;
    if(data && data.layers && data.style && data.basemap && data.position && data.story_id){
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
            Map.createStoryMap(data.layers, data.style, data.basemap, data.position, data.story_id, data.title, user_id)
            .then(function(result){
              res.status(200).send({success: true, map_id: result[0]});
            }).catch(apiError(res, 500));
      }else {
        notAllowedError(res, 'story');
      }
    }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }
  });

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

    app.get('/hub/:hubid/api/members', function(req, res) {
      var hub_id = req.params.hubid;
      Hub.getHubMembers(hub_id)
      .then(function(members){
        res.status(200).send({success: true, members});
      }).catch(apiError(res, 500));
  });

    app.post('/hub/:hubid/api/addmember', function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }

      var session_user_id = req.session.user.id;
      var data = req.body;

      if(data && data.hub_id && data.display_name && data.asAdmin !== undefined){
        User.getUserByName(data.display_name)
        .then(function(user){
          if(user){
            return Hub.allowedToModify(data.hub_id, session_user_id)
            .then(function(allowed){
              if(allowed){
                var role = 'Member';
                if(data.asAdmin){
                  role = 'Administrator';
                }
                return Hub.getHubMembers(data.hub_id)
                .then(function(members){
                  var alreadyInHub = false;
                  members.forEach(function(member){
                    if(member.id == user.id){
                        alreadyInHub = true;
                    }
                  });
                  if(!alreadyInHub){
                    return Hub.addHubMember(data.hub_id, user.id, role)
                    .then(function(){
                      debug('Added ' + data.display_name + ' to ' + data.hub_id);
                      Email.send({
                        from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
                        to: user.email,
                        subject: req.__('Welcome to Hub:') + ' ' + data.hub_id + ' - ' + MAPHUBS_CONFIG.productName,
                        text: user.display_name + ',\n' +
                          req.__('You have been added to the hub') + ' ' + data.hub_id
                        ,
                        html: user.display_name + ',<br />' +
                          req.__('You have been added to the hub') + ' ' + data.hub_id
                        });
                      res.status(200).send({success: true});
                    });
                  }else{
                      res.status(200).send({success: false, "error": req.__('User is already a member of this hub.')});
                    return;
                  }
                  });
              } else {
                notAllowedError(res, 'hub');
              }
            });
          }else{
            res.status(200).send({
              success: false,
              error: 'User not found'
            });
            return;
          }
        }).catch(apiError(res, 500));
      } else {
        apiDataError(res);
      }

    });


      app.post('/hub/:hubid/api/updatememberrole', function(req, res) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          res.status(401).send("Unauthorized, user not logged in");
          return;
        }

        var session_user_id = req.session.user.id;
        var data = req.body;

        if(data && data.hub_id && data.user_id && data.role){
          User.getUser(data.user_id)
          .then(function(user){
            Hub.allowedToModify(data.hub_id, session_user_id)
            .then(function(allowed){
              if(allowed){
                Hub.updateHubMemberRole(data.hub_id, user.id, data.role)
                .then(function(){
                  debug('Added role' + data.role + ' to ' + data.display_name + ' of ' + data.hub_id);
                  res.status(200).send({success: true});
                });
              } else {
                notAllowedError(res, 'hub');
              }
            }).catch(apiError(res, 500));
          }).catch(apiError(res, 500));
        } else {
          apiDataError(res);
        }

      });

      app.post('/hub/:hubid/api/removemember', function(req, res) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          res.status(401).send("Unauthorized, user not logged in");
          return;
        }

        var session_user_id = req.session.user.id;
        var data = req.body;

        if(data && data.hub_id && data.user_id){
          User.getUser(data.user_id)
          .then(function(user){
            Hub.allowedToModify(data.hub_id, session_user_id)
            .then(function(allowed){
              if(allowed){
                //don't allow removal of last admin
                Hub.getHubMembersByRole(data.hub_id, 'Administrator')
                .then(function(result){
                  if(result && result.length == 1 && result[0].user_id == session_user_id){
                    //last admin
                    debug('Attempted to delete last admin ' + data.display_name + ' from ' + data.hub_id);
                    throw new Error('Unable to delete only administrator from the hub. Please assign another admin first.');
                  }else{
                    return Hub.removeHubMember(data.hub_id, user.id)
                    .then(function(){
                      debug('Removed ' + data.display_name + ' from ' + data.hub_id);
                      Email.send({
                        from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
                        to: user.email,
                        subject: req.__('Removed from Hub:') + ' ' + data.hub_id + ' - ' + MAPHUBS_CONFIG.productName,
                        text: user.display_name + ',\n' +
                          req.__('You have been removed from the hub') + ' ' + data.hub_id
                        ,
                        html: user.display_name + ',<br />' +
                          req.__('You have been removed from the hub') + ' ' + data.hub_id
                        });
                      res.status(200).send({success: true});
                    }).catch(apiError(res, 500));
                  }
                }).catch(apiError(res, 500));

                } else {
                  notAllowedError(res, 'hub');
                }
            }).catch(apiError(res, 500));
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
