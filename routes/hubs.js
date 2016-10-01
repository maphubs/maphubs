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
          title: req.__('Hubs') + ' - ' + config.productName,
          props: {
            featuredHubs, popularHubs, recentHubs
          }, req
        });
      }).catch(nextError(next));
  });


  //Hub subdomains

  //redirect beta.maphub.com links
  app.get('/hub/:id/*', function(req, res, next) {

    var id = req.params.id;
    if(id == 'beta'){
      res.redirect(baseUrl + req.path.replace("/hub/"+id, ""));
    }else{
      next();
    }

  });

  app.use('/hub/:hubid/assets/', express.static('assets'));


  var renderHubPage = function(hub, canEdit, req, res){
    debug('loading hub, canEdit: ' + canEdit);
    return Promise.all([
        Layer.getHubLayers(hub.hub_id),
        Hub.getHubStories(hub.hub_id, canEdit)
      ])
      .then(function(result) {
        var layers = result[0];
        var stories = result[1];
        res.render('hubinfo', {
          title: hub.name + ' - ' + config.productName,
          hideFeedback: true,
          fontawesome: true,
          props: {
            hub, layers, stories, canEdit
          }, req
        });
      });
  };

  app.get('/hub/:hubid', function(req, res, next) {
    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    Hub.getHubByID(hub_id)
      .then(function(hub) {
        if(hub == null){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
        recordHubView(req.session, hub_id, user_id, next);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          return renderHubPage(hub, false, req, res);
        } else {
          return Hub.allowedToModify(hub_id, user_id)
          .then(function(allowed){
            if(allowed){
              return renderHubPage(hub, true, req, res);
            }else{
              return renderHubPage(hub, false, req, res);
            }
          });
        }
      }).catch(nextError(next));
  });

  var renderHubMapPage = function(hub, canEdit, req, res){
      return Promise.all([
        Layer.getHubLayers(hub.hub_id)
      ])
      .then(function(results) {
        var layers = results[0];
        res.render('hubmap', {
          title: hub.name + '|' + req.__('Map') + ' - ' + config.productName,
          hideFeedback: true,
          props: {
            hub, layers, canEdit
          }, req
        });
      });
  };

  app.get('/hub/:hubid/map', function(req, res, next) {

    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    Hub.getHubByID(hub_id)
      .then(function(hub) {
        if(hub == null){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
        recordHubView(req.session, hub_id, user_id, next);

      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return renderHubMapPage(hub, false, req, res);
      } else {
        return Hub.allowedToModify(hub_id, user_id)
        .then(function(allowed){
          if(allowed){
            return renderHubMapPage(hub, true, req, res);
          }else{
            return renderHubMapPage(hub, false, req, res);
          }
        });
      }
    }).catch(nextError(next));
  });

  var renderHubStoryPage = function(hub, canEdit, req, res){
      return Hub.getHubStories(hub.hub_id, canEdit)
      .then(function(stories) {
        res.render('hubstories', {
          title: hub.name + '|' + req.__('Stories') + ' - ' + config.productName,
          hideFeedback: true,
          props: {
            hub, stories, canEdit
          }, req
        });
      });
  };

  app.get('/hub/:hubid/stories', function(req, res, next) {

    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    Hub.getHubByID(hub_id)
      .then(function(hub) {
        if(hub == null){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
        recordHubView(req.session, hub_id, user_id, next);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          return renderHubStoryPage(hub, false, req, res);
        } else {
          return Hub.allowedToModify(hub_id, user_id)
          .then(function(allowed){
            if(allowed){
              return renderHubStoryPage(hub, true, req, res);
            }else{
              return renderHubStoryPage(hub, false, req, res);
            }
          });
        }
      }).catch(nextError(next));
  });

  var renderHubResourcesPage = function(hub, canEdit, req, res){
      res.render('hubresources', {
        title: hub.name + '|' + req.__('Resources') + ' - ' + config.productName,
        hideFeedback: true,
        fontawesome: true,
        rangy: true,
        props: {
          hub, canEdit
        }, req
      });
  };

  app.get('/hub/:hubid/resources', function(req, res, next) {

    var hub_id = req.params.hubid;
    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }
    Hub.getHubByID(hub_id)
      .then(function(hub) {
        if(hub == null){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
    recordHubView(req.session, hub_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return renderHubResourcesPage(hub, false, req, res);
    } else {
      return Hub.allowedToModify(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          return renderHubResourcesPage(hub, true, req, res);
        }else{
          return renderHubResourcesPage(hub, false, req, res);
        }
      });
    }
  }).catch(nextError(next));
  });

  app.get('/hub/:hubid/story/create', login.ensureLoggedIn(), function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect(baseUrl + '/unauthorized?path='+req.path);
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
        res.redirect(baseUrl + '/unauthorized?path='+req.path);
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
        res.redirect(baseUrl + '/unauthorized?path='+req.path);
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
             var imageUrl = '';
            if(story.firstimage){
              imageUrl = story.firstimage;
            }
            res.render('hubstory', {
              title: story.title,
              addthis: true,
              props: {
                story, hub, canEdit: false
              },
              twitterCard: {
                title: story.title,
                description: story.firstline,
                image: imageUrl
              },
              req
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
             var imageUrl = '';
            if(story.firstimage){
              imageUrl = story.firstimage;
            }
            res.render('hubstory', {
              title: story.title,
              addthis: true,
              props: {
                story, hub, canEdit
              },
              twitterCard: {
                title: story.title,
                description: story.firstline,
                image: imageUrl
              },
               req
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
    var hub_id = req.params.hub;
    if(!map_id){
      apiDataError(res, 'Bad Request: MapId not found');
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, false);
    } else {
      //get user id
      var user_id = req.session.user.id;

      Hub.allowedToModify(hub_id, user_id)
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
                  title: hub.name + '|' + req.__('Settings') + ' - ' + config.productName,
                  props: {
                    hub, layers, members
                  }
                });
              }).catch(nextError(next));
          } else {
            res.redirect(baseUrl + '/unauthorized?path='+req.path);
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
          Image.removeAllStoryImages(data.story_id)
            .then(function() {
              return Story.delete(data.story_id)
                .then(function() {
                  res.send({
                    success: true
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

  app.post('/hub/:hubid/api/story/addimage', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.image) {
      Story.allowedToModify(data.story_id, user_id)
      .then(function(allowed){
        if(allowed){
          Image.addStoryImage(data.story_id, data.image, data.info)
            .then(function(image_id) {
              res.send({
                success: true, image_id
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
                        from: config.productName + ' <' + local.fromEmail + '>',
                        to: user.email,
                        subject: req.__('Welcome to Hub:') + ' ' + data.hub_id + ' - ' + config.productName,
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
                        from: config.productName + ' <' + local.fromEmail + '>',
                        to: user.email,
                        subject: req.__('Removed from Hub:') + ' ' + data.hub_id + ' - ' + config.productName,
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

    app.post('/hub/:hubid/api/user/setlocale', function(req, res) {
      var data = req.body;
      if(data.locale){
        req.session.locale = data.locale;
        req.setLocale(data.locale);
      }
      res.status(200).send({success: true});

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

  app.get('/hub/:hubid/group/:id/image/thumbnail', function(req, res) {
    var group_id = req.params.id;
    res.redirect(baseUrl + '/group/' + group_id + '/image/thumbnail');
  });

  app.get('/hub/:id/hub/:hubid/images/logo', function(req, res) {
    var hub_id = req.params.id;
    res.redirect(baseUrl + '/hub/' + hub_id + '/images/logo');
  });

  app.get('/hub/:id/hub/:hubid/images/banner', function(req, res) {
    var hub_id = req.params.id;

    res.redirect(baseUrl + '/hub/' + hub_id + '/images/banner');
  });

  app.get('/hub/:id/hub/:hubid/images/logo/thumbnail', function(req, res) {
    var hub_id = req.params.id;
    res.redirect(baseUrl + '/hub/' + hub_id + '/images/logo/thumbnail');
  });

  app.get('/hub/:id/hub/:hubid/images/banner/thumbnail', function(req, res) {
    var hub_id = req.params.id;

    res.redirect(baseUrl + '/hub/' + hub_id + '/images/banner/thumbnail');
  });

  app.get('/hub/:id/images/story/:storyid/firstimage', function(req, res) {
    var storyid = req.params.storyid;

    res.redirect(baseUrl + '/images/story/' + storyid + '/firstimage');
  });

  app.get('/hub/:id/images/story/:storyid/image/:imageid.jpg', function(req, res) {
    var storyid = req.params.storyid;
    var imageid = req.params.imageid;

    res.redirect(baseUrl + '/images/story/' + storyid + '/image/' + imageid + '.jpg');
  });

  app.get('/hub/:id/images/story/:storyid/thumbnail/:imageid.jpg', function(req, res) {
    var storyid = req.params.storyid;
    var imageid = req.params.imageid;

    res.redirect(baseUrl + '/images/story/' + storyid + '/thumbnail/' + imageid + '.jpg');
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

  app.get('/hub/:id/api/user/search/suggestions', function(req, res) {
    var query = req.query;
    res.redirect(baseUrl + '/api/user/search/suggestions?q='+ query.q);
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

  app.get('/hub/:id/api/screenshot/map/:mapid.png', function(req, res) {
    var mapid = req.params.mapid;
    res.redirect(baseUrl + '/api/screenshot/map/' + mapid + '.png');
  });

  app.get('/hub/:id/group/:groupid', function(req, res) {
    var groupid = req.params.groupid;
    res.redirect(baseUrl + '/group/' + groupid);
  });

  app.get('/hub/:id/api/layers/info/:id', function(req, res) {
    var id = req.params.id;
    res.redirect(baseUrl + '/api/layers/info/' + id);
  });

  app.get('/hub/:id/api/map/info/:id', function(req, res) {
    var id = req.params.id;
    res.redirect(baseUrl + '/api/map/info/' + id);
  });

  app.get('/hub/:id/layer/info/:id/:name', function(req, res) {
    var id = req.params.id;
    var name = req.params.name;
    res.redirect(baseUrl + '/layer/info/' + id + '/' + name);
  });

  app.get('/hub/:id/feature/:layerid/:osmid/:name', function(req, res) {
    var layerid = req.params.layerid;
    var osmid = req.params.osmid;
    var name = req.params.name;
    res.redirect(baseUrl + '/feature/' + layerid + '/' + osmid + '/' + name);
  });


};
