/* @flow weak */
var express = require('express');
var local = require('../local');
var Layer = require('../models/layer');
var Story = require('../models/story');
var Hub = require('../models/hub');
var User = require('../models/user');
var Map = require('../models/map');
var Image = require('../models/image');
var Stats = require('../models/stats');
var Email = require('../services/email-util');
//var path = require('path');
var login = require('connect-ensure-login');
//var log = require('../services/log.js');
var debug = require('../services/debug')('routes/hubs');
var Promise = require('bluebird');
var MapUtils = require('../services/map-utils');

var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;

module.exports = function(app) {


 var recordHubView = function(session, hub_id, user_id, next){
   if(!session.hubviews){
     session.hubviews = {};
   }
   if(!session.hubviews[hub_id]){
     session.hubviews[hub_id] = 1;
     Stats.addHubView(hub_id, user_id).catch(nextError(next));
   }else{
     var views = session.hubviews[hub_id];

     session.hubviews[hub_id] = views + 1;
   }

   session.views = (session.views || 0) + 1;
 };

 var recordStoryView = function(session, story_id, user_id,  next){
   if(!session.storyviews){
     session.storyviews = {};
   }
   if(!session.storyviews[story_id]){
     session.storyviews[story_id] = 1;
     Stats.addStoryView(story_id, user_id).catch(nextError(next));
   }else{
     var views = session.storyviews[story_id];

     session.storyviews[story_id] = views + 1;
   }

   session.views = (session.views || 0) + 1;
 };

  //Views
  app.get('/hubs', function(req, res, next) {

    Promise.all([
      Hub.getFeaturedHubs(),
      Hub.getPopularHubs(),
      Hub.getRecentHubs()
    ])
      .then(function(results) {
        var featuredHubs = results[0];
        var popularHubs = results[1];
        var recentHubs = results[2];
        res.render('hubs', {
          title: 'Hubs - MapHubs',
          props: {
            featuredHubs, popularHubs, recentHubs
          }, req
        });
      }).catch(nextError(next));
  });


  //Hub subdomains

  app.use('/hub/:hubid/assets/', express.static('assets'));


  var renderHubPage = function(hub_id, canEdit, req, res, next){
    Hub.getHubByID(hub_id)
      .then(function(hub) {
        debug('loading hub, canEdit: ' + canEdit);
        Promise.all([
            Layer.getHubLayers(hub.hub_id),
            Hub.getHubStories(hub.hub_id, canEdit)
          ])
          .then(function(result) {
            var layers = result[0];
            var stories = result[1];
            res.render('hubinfo', {
              title: hub.name + ' - MapHubs',
              hideFeedback: true,
              fontawesome: true,
              props: {
                hub, layers, stories, canEdit
              }, req
            });
          }).catch(nextError(next));
      }).catch(nextError(next));
  };

  app.get('/hub/:hubid', function(req, res, next) {
    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    recordHubView(req.session, hub_id, user_id, next);
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      renderHubPage(hub_id, false, req, res, next);
    } else {
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          renderHubPage(hub_id, true, req, res, next);
        }else{
          renderHubPage(hub_id, false, req, res, next);
        }
      }).catch(nextError(next));
    }
  });

  var renderHubMapPage = function(hub_id, canEdit, req, res, next){
    Hub.getHubByID(hub_id)
      .then(function(hub) {
          Promise.all([
            Layer.getHubLayers(hub.hub_id)
          ])
          .then(function(results) {
            var layers = results[0];
            res.render('hubmap', {
              title: hub.name + ' - Map - MapHubs',
              hideFeedback: true,
              props: {
                hub, layers, canEdit
              }, req
            });
          }).catch(nextError(next));
      }).catch(nextError(next));
  };

  app.get('/hub/:hubid/map', function(req, res, next) {

    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    recordHubView(req.session, hub_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      renderHubMapPage(hub_id, false, req, res, next);
    } else {
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          renderHubMapPage(hub_id, true, req, res, next);
        }else{
          renderHubMapPage(hub_id, false, req, res, next);
        }
      }).catch(nextError(next));
    }

  });

  var renderHubStoryPage = function(hub_id, canEdit, req, res, next){
    Hub.getHubByID(hub_id)
      .then(function(hub) {
          Hub.getHubStories(hub.hub_id, canEdit)
          .then(function(stories) {
            res.render('hubstories', {
              title: hub.name + ' - Stories - MapHubs',
              hideFeedback: true,
              props: {
                hub, stories, canEdit
              }, req
            });
          }).catch(nextError(next));
      }).catch(nextError(next));
  };

  app.get('/hub/:hubid/stories', function(req, res, next) {

    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    recordHubView(req.session, hub_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      renderHubStoryPage(hub_id, false, req, res, next);
    } else {
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          renderHubStoryPage(hub_id, true, req, res, next);
        }else{
          renderHubStoryPage(hub_id, false, req, res, next);
        }
      }).catch(nextError(next));
    }

  });

  var renderHubResourcesPage = function(hub_id, canEdit, req, res, next){
    Hub.getHubByID(hub_id)
      .then(function(hub) {
          res.render('hubresources', {
            title: hub.name + ' - Resources - MapHubs',
            hideFeedback: true,
            fontawesome: true,
            rangy: true,
            props: {
              hub, canEdit
            }, req
          });
      }).catch(nextError(next));
  };

  app.get('/hub/:hubid/resources', function(req, res, next) {

    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    recordHubView(req.session, hub_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      renderHubResourcesPage(hub_id, false, req, res, next);
    } else {
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          renderHubResourcesPage(hub_id, true, req, res, next);
        }else{
          renderHubResourcesPage(hub_id, false, req, res, next);
        }
      }).catch(nextError(next));
    }

  });

  app.get('/hub/:hubid/story/create', login.ensureLoggedIn(), function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/unauthorized');
    }
    var user_id = req.session.user.id;
    var hub_id = req.params.hubid;
    Hub.allowedToModify(hub_id, user_id)
    .then(function(allowed){
      if(allowed){
        Hub.getHubByID(hub_id)
        .then(function(hub){
          res.render('createhubstory', {
            title: 'Create Story',
            fontawesome: true,
            rangy: true,
            props: {
              hub
            }, req
          });
        }).catch(nextError(next));
      }else{
        res.redirect('/unauthorized');
      }
    }).catch(nextError(next));
  });

  app.get('/hub/:hubid/story/:story_id/edit/*', login.ensureLoggedIn(), function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var hub_id = req.params.hubid;
    var story_id = parseInt(req.params.story_id || '', 10);
    Hub.allowedToModify(hub_id, user_id)
    .then(function(allowed){
      if(allowed){
        Hub.getHubByID(hub_id)
        .then(function(hub){
          Promise.all([
            Story.getStoryByID(story_id)
          ])
            .then(function(results) {
              var story = results[0];
              res.render('edithubstory', {
                title: 'Editing: ' + story.title,
                fontawesome: true,
                rangy: true,
                props: {
                  story,
                  hub
                }, req
              });
            }).catch(nextError(next));
        }).catch(nextError(next));
      }else{
        res.redirect('/unauthorized');
      }
    }).catch(nextError(next));


  });


  app.get('/hub/:hubid/story/:story_id/*', function(req, res, next) {

    var hub_id = req.params.hubid;
    var story_id = parseInt(req.params.story_id || '', 10);
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    recordStoryView(req.session, story_id, user_id, next);
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
        Promise.all([
          Story.getStoryByID(story_id),
          Hub.getHubByID(hub_id)
        ])
          .then(function(results) {
            var story = results[0];
            var hub = results[1];
            res.render('hubstory', {
              title: story.title,
              addthis: true,
              props: {
                story, hub, canEdit: false
              }, req
            });
          }).catch(nextError(next));
    }else{
      Story.allowedToModify(story_id, user_id)
      .then(function(allowed){
        var canEdit = false;
        if(allowed){
          canEdit = true;
        }
        Promise.all([
          Story.getStoryByID(story_id),
          Hub.getHubByID(hub_id)
        ])
          .then(function(results) {
            var story = results[0];
            var hub = results[1];
            res.render('hubstory', {
              title: story.title,
              addthis: true,
              props: {
                story, hub, canEdit
              }, req
            });
          }).catch(nextError(next));
      });
    }
  });

  app.get('/hub/:hub/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/hub/:hub/api/user/details/json', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(200).send({loggedIn: false, user: null});
      return;
    }
    var user_id = req.session.user.id;
    User.getUser(user_id)
      .then(function(user){
        res.status(200).send({loggedIn: true, user});
      }).catch(apiError(res, 500));
  });


  app.get('/hub/:hub/map/embed/:map_id', function(req, res, next) {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res, 'Bad Request: MapId not found');
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, false);
    } else {
      //get user id
      var user_id = req.session.user.id;

      Map.allowedToModify(map_id, user_id)
      .then(function(allowed){
        MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, allowed);
      }).catch(apiError(res, 500));
    }
  });

    app.get('/hub/:id/admin', login.ensureLoggedIn(), function(req, res, next) {

      var user_id = req.session.user.id;
      var hub_id = req.params.id;

      //confirm that this user is allowed to administer this hub
      Hub.getHubRole(user_id, hub_id)
        .then(function(result) {
          if (result && result.length == 1 && result[0].role == 'Administrator') {
            Promise.all([
                Hub.getHubByID(hub_id),
                Layer.getHubLayers(hub_id),
                Hub.getHubMembers(hub_id)
              ])
              .then(function(result) {
                var hub = result[0];
                var layers = result[1];
                var members = result[2];
                res.render('hubadmin', {
                  title: hub.name + ' Settings - MapHubs',
                  props: {
                    hub, layers, members
                  }
                });
              }).catch(nextError(next));
          } else {
            res.redirect('/unauthorized');
          }
        }).catch(nextError(next));

    });


  //API Endpoints
  app.post('/hub/:hubid/api/hub/story/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.title && data.body && data.firstline) {
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
          Story.updateStory(data.story_id, data.title, data.body, data.firstline, data.firstimage)
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
          Story.delete(data.story_id)
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

  app.post('/hub/:hubid/api/hub/story/create', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var hub_id = req.params.hubid;
    var data = req.body;
    if (data && data.title && data.body && data.firstline) {
      Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          Story.createHubStory(hub_id, data.title, data.body, data.firstline, data.firstimage)
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

  app.post('/hub/:hubid/api/map/create/storymap', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;

    var data = req.body;
    if(data && data.layers && data.style && data.position && data.story_id){
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
            Map.createStoryMap(data.layers, data.style, data.position, data.story_id, data.title, user_id)
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
          Hub.updateHub(data.hub_id, data.name, data.description, data.tagline, data.published, data.resources, data.about, session_user_id)
            .then(function(result) {
              if (result && result == 1) {
                var commands = [];
                if(data.style && data.layers && data.layers.length > 0){
                  commands.push(Map.saveHubMap(data.layers, data.style, data.position, data.hub_id, session_user_id));
                }
                if(data.logoImage){
                    commands.push(Image.setHubImage(data.hub_id, data.logoImage, null, 'logo'));
                }
                if(data.bannerImage){
                    commands.push(Image.setHubImage(data.hub_id, data.bannerImage, null, 'banner'));
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
          Hub.allowedToModify(data.hub_id, session_user_id)
          .then(function(allowed){
            if(allowed){
              var role = 'Member';
              if(data.asAdmin){
                role = 'Administrator';
              }
              Hub.addHubMember(data.hub_id, user.id, role)
              .then(function(){
                debug('Added ' + data.display_name + ' to ' + data.hub_id);
                Email.send({
                  from: 'MapHubs <info@maphubs.com>',
                  to: user.email,
                  subject: req.__('Welcome to Hub:') + ' ' + data.hub_id + ' - MapHubs',
                  text: user.display_name + ',\n' +
                    req.__('You have been added to the hub') + ' ' + data.hub_id
                  ,
                  html: user.display_name + ',<br />' +
                    req.__('You have been added to the hub') + ' ' + data.hub_id
                  });
                res.status(200).send({success: true});
              })
              .catch(apiError(res, 500));
            } else {
              notAllowedError(res, 'hub');
            }
          })
          .catch(apiError(res, 500));
        })
        .catch(apiError(res, 500));
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
                        from: 'MapHubs <info@maphubs.com>',
                        to: user.email,
                        subject: req.__('Removed from Hub:') + ' ' + data.hub_id + ' - MapHubs',
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

    if(data && data.hub_id && data.layers && data.style && data.position ){
      Hub.allowedToModify(data.hub_id, session_user_id)
      .then(function(allowed){
        if(allowed){
            Map.saveHubMap(data.layers, data.style, data.position, data.hub_id, session_user_id)
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
            Hub.deleteHub(data.hub_id)
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


 //Redirects
 app.get('/hub/:id/login', function(req, res) {
   var hub_id = req.params.id;
   if(req.session){
     var hubBaseUrl = urlUtil.getHubUrl(hub_id, local.host, local.port);
     req.session.returnTo = hubBaseUrl;
   }
   res.redirect(baseUrl + '/login');
 });

  app.get('/hub/:hubid/group/:id/image', function(req, res) {
    var group_id = req.params.id;
    res.redirect(baseUrl + '/group/' + group_id + '/image');
  });

  app.get('/hub/:id/hub/:hubid/images/logo', function(req, res) {
    var hub_id = req.params.id;
    res.redirect(baseUrl + '/hub/' + hub_id + '/images/logo');
  });

  app.get('/hub/:id/hub/:hubid/images/banner', function(req, res) {
    var hub_id = req.params.id;

    res.redirect(baseUrl + '/hub/' + hub_id + '/images/banner');
  });

  app.get('/hub/:id/api/layers/search/suggestions', function(req, res) {
    var query = req.query;
    res.redirect(baseUrl + '/api/layers/search/suggestions?q='+ query.q);
  });

  app.get('/hub/:id/api/hubs/search/suggestions', function(req, res) {
    var query = req.query;
    res.redirect(baseUrl + '/api/hubs/search/suggestions?q='+ query.q);
  });

  app.get('/hub/:id/api/layers/search', function(req, res) {
    var query = req.query;
    res.redirect(baseUrl + '/api/layers/search?q='+ query.q);
  });

  app.get('/hub/:id/api/layers/all', function(req, res) {
    res.redirect(baseUrl + '/api/layers/all');
  });

  app.get('/hub/:id/api/layers/recommended/user', function(req, res) {
    res.redirect(baseUrl + '/api/layers/recommended/user');
  });

  app.get('/hub/:id/api/layers/recommended/hub/*', function(req, res) {
    var hub_id = req.params.id;
    res.redirect(baseUrl + '/api/layers/recommended/hub/'+hub_id);
  });

  app.get('/hub/:id/map/embed/:mapid', function(req, res) {
    var mapid = req.params.mapid;
    res.redirect(baseUrl + '/map/embed/' + mapid );
  });

  app.get('/hub/:id/map/embed/:mapid/static', function(req, res) {
    var mapid = req.params.mapid;
    res.redirect(baseUrl + '/map/embed/' + mapid + '/static');
  });

  app.get('/hub/:id/group/:groupid', function(req, res) {
    var groupid = req.params.groupid;
    res.redirect(baseUrl + '/group/' + groupid);
  });


};
