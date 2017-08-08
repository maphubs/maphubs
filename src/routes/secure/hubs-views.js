// @flow
var Story = require('../../models/story');
var Hub = require('../../models/hub');
var User = require('../../models/user');
var Group = require('../../models/group');
var Map = require('../../models/map');
var Stats = require('../../models/stats');
var login = require('connect-ensure-login');
//var log = require('../../services/log.js');
var debug = require('../../services/debug')('routes/hubs');
var Promise = require('bluebird');
var urlUtil = require('../../services/url-util');
var baseUrl = urlUtil.getBaseUrl();
var nextError = require('../../services/error-response').nextError;
var csrfProtection = require('csurf')({cookie: false});
var privateHubCheck = require('../../services/private-hub-check').middlewareView;

module.exports = function(app: any) {

 var recordHubView = function(session: any, hub_id: string, user_id: number, next: any){

   if(!session.hubviews){
     session.hubviews = {};
   }
   if(!session.hubviews[hub_id]){
     session.hubviews[hub_id] = 1;
     Stats.addHubView(hub_id, user_id).catch(nextError(next));
   }else{
     const views: number = session.hubviews[hub_id];
     session.hubviews[hub_id] = views + 1;
   }

   session.views = (session.views || 0) + 1;
 };

 var recordStoryView = function(session, story_id: number, user_id:number,  next){
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
  app.get('/hubs', csrfProtection, (req, res, next) => {

    Promise.all([
      Hub.getFeaturedHubs(),
      Hub.getPopularHubs(),
      Hub.getRecentHubs()
    ])
      .then((results) => {
        var featuredHubs = results[0];
        var popularHubs = results[1];
        var recentHubs = results[2];
      
        return res.render('hubs', {
          title: req.__('Hubs') + ' - ' + MAPHUBS_CONFIG.productName,
          props: {
            featuredHubs, popularHubs, recentHubs
          }, req
        });
        
      }).catch(nextError(next));
  });

  app.get('/hubs/all', csrfProtection, (req, res, next) => {
    Hub.getAllHubs().orderBy('omh.hubs.name')
    .then((hubs) => {
      return res.render('allhubs', {
        title: req.__('Hubs') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          hubs
        }, req
      });
    }).catch(nextError(next));
  });

  app.get('/user/:username/hubs', csrfProtection, (req, res, next) => {

    var username = req.params.username;
    debug.log(username);
    if(!username){nextError(next);}
    var canEdit = false;

    function completeRequest(userCanEdit){
      User.getUserByName(username)
      .then((user) => {
        if(user){
            return Promise.all([
              Hub.getPublishedHubsForUser(user.id),
              Hub.getDraftHubsForUser(user.id)
            ])
          .then((results) => {
            var publishedHubs = results[0];
            var draftHubs = [];
            if(userCanEdit){
              draftHubs = results[1];
            }
            return res.render('userhubs', {title: 'Hubs - ' + username, props:{user, publishedHubs, draftHubs, canEdit: userCanEdit}, req});
          });
        }else{
          return res.redirect('/notfound?path='+req.path);
        }
      }).catch(nextError(next));
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          completeRequest();
    } else {
      //get user id
      var user_id = req.session.user.maphubsUser.id;

      //get user for logged in user
      User.getUser(user_id)
      .then((user) => {
        //flag if requested user is logged in user
        if(user.display_name === username){
          canEdit = true;
        }
        return completeRequest(canEdit);
      }).catch(nextError(next));
    }
  });


  var renderHubPage = function(hub, canEdit: boolean, req, res){
    debug.log(`loading hub, canEdit: ${canEdit.toString()}`);
    var dataQueries =  [
        Map.getMap(hub.map_id),
        Map.getMapLayers(hub.map_id, canEdit),
        Hub.getHubStories(hub.hub_id, canEdit)
      ];
      if(canEdit){
        dataQueries.push(Map.getUserMaps(req.session.user.maphubsUser.id)),
        dataQueries.push(Map.getPopularMaps());
      }
    return Promise.all(dataQueries)
      .then((result) => {
        var map = result[0];
        var layers = result[1];
        var stories = result[2];
        var myMaps, popularMaps;
        if(canEdit){
          myMaps = result[4];
          popularMaps = result[5];
        }

        var image = urlUtil.getBaseUrl() + '/hub/' + hub.hub_id + '/images/logo';

        return res.render('hubinfo', {
          title: hub.name + ' - ' + MAPHUBS_CONFIG.productName,
          description: hub.description,
          hideFeedback: !MAPHUBS_CONFIG.mapHubsPro,
          fontawesome: true,
          props: {
            hub, map, layers, stories, canEdit, myMaps, popularMaps
          },
          twitterCard: {
            card: 'summary',
            title: hub.name,
            description: hub.description,
            image,
            imageType: 'image/png',
            imageWidth: 300,
            imageHeight: 300
          },
           req
        });
      });
  };

  app.get('/hub/:hubid', csrfProtection, privateHubCheck, (req, res, next) => {
    var hub_id_input: string = req.params.hubid;
    var user_id: number;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    Hub.getHubByID(hub_id_input)
      .then((hub) => {
        if(!hub){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
        recordHubView(req.session, hub.hub_id, user_id, next);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          return renderHubPage(hub, false, req, res);
        } else {
          return Hub.allowedToModify(hub.hub_id, user_id)
          .then((allowed) => {
            if(allowed){
              return renderHubPage(hub, true, req, res);
            }else{
              return renderHubPage(hub, false, req, res);
            }
          });
        }
      }).catch(nextError(next));
  });

  var renderHubStoryPage = function(hub, canEdit, req, res){
      return Hub.getHubStories(hub.hub_id, canEdit)
      .then((stories) => {
        return res.render('hubstories', {
          title: hub.name + '|' + req.__('Stories') + ' - ' + MAPHUBS_CONFIG.productName,
          hideFeedback: !MAPHUBS_CONFIG.mapHubsPro,
          props: {
            hub, stories, canEdit
          }, req
        });
      });
  };

  app.get('/hub/:hubid/stories', csrfProtection, privateHubCheck, (req, res, next) => {

    const hub_id_input: string = req.params.hubid;
    let user_id: number;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    Hub.getHubByID(hub_id_input)
      .then((hub) => {
        if(!hub){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
        recordHubView(req.session, hub.hub_id, user_id, next);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          return renderHubStoryPage(hub, false, req, res);
        } else {
          return Hub.allowedToModify(hub.hub_id, user_id)
          .then((allowed) => {
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
    return res.render('hubresources', {
      title: hub.name + '|' + req.__('Resources') + ' - ' + MAPHUBS_CONFIG.productName,
      hideFeedback: !MAPHUBS_CONFIG.mapHubsPro,
      fontawesome: true,
      rangy: true,
      props: {
        hub, canEdit
      }, req
    });
  };

  app.get('/hub/:hubid/resources', csrfProtection, privateHubCheck, (req, res, next) => {

    const hub_id_input: string = req.params.hubid;
    let user_id: number;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    Hub.getHubByID(hub_id_input)
      .then((hub) => {
        if(!hub){
          res.redirect(baseUrl + '/notfound?path='+req.path);
          return;
        }
        recordHubView(req.session, hub.hub_id, user_id, next);

        if (!req.isAuthenticated || !req.isAuthenticated()) {
          return renderHubResourcesPage(hub, false, req, res);
        } else {
          return Hub.allowedToModify(hub.hub_id, user_id)
          .then((allowed) => {
            if(allowed){
              return renderHubResourcesPage(hub, true, req, res);
            }else{
              return renderHubResourcesPage(hub, false, req, res);
            }
          });
        }
    }).catch(nextError(next));
  });

  app.get('/createhub', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {
    
    var user_id = req.session.user.maphubsUser.id;

    Group.getGroupsForUser(user_id)
    .then((groups) => {
      return res.render('hubbuilder', {
        title: req.__('Create Hub') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {groups}, req
      });
    }).catch(nextError(next));
  });

  app.get('/hub/:hubid/story/create', login.ensureLoggedIn(), csrfProtection, (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect(baseUrl + '/unauthorized?path='+req.path);
    }
    const user_id: number = req.session.user.maphubsUser.id;
    const hub_id_input: string = req.params.hubid;
    Hub.allowedToModify(hub_id_input, user_id)
    .then((allowed: bool) => {
      if(allowed){
        return Hub.getHubByID(hub_id_input)
        .then((hub) => {
          return Story.createHubStory(hub.hub_id, user_id)
          .then((story_id) => {
            return Promise.all([
              Map.getUserMaps(req.session.user.maphubsUser.id),
              Map.getPopularMaps()
            ]).then((results: Array<any>) => {
              var myMaps = results[0];
              var popularMaps = results[1];
              return res.render('createhubstory', {
                title: 'Create Story',
                fontawesome: true,
                rangy: true,
                props: {
                  hub, myMaps, popularMaps, story_id
                }, req
              });
            });
          });
        }).catch(nextError(next));
      }else{
        return res.redirect(baseUrl + '/unauthorized?path='+req.path);
      }
    }).catch(nextError(next));
  });

  app.get('/hub/:hubid/story/:story_id/edit/*', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var hub_id = req.params.hubid;
    var story_id = parseInt(req.params.story_id || '', 10);
    Hub.allowedToModify(hub_id, user_id)
    .then((allowed) => {
      if(allowed){
        return Promise.all([
          Hub.getHubByID(hub_id),
          Story.getStoryByID(story_id),
          Map.getUserMaps(req.session.user.maphubsUser.id),
          Map.getPopularMaps()
        ]).then((results) => {
          var hub = results[0];
          var story = results[1];
          var myMaps = results[2];
          var popularMaps = results[3];
            return res.render('edithubstory', {
              title: 'Editing: ' + story.title,
              fontawesome: true,
              rangy: true,
              props: {
                story,
                hub, myMaps, popularMaps
              }, req
            });
          }).catch(nextError(next));
      }else{
        return res.redirect(baseUrl + '/unauthorized?path='+req.path);
      }
    }).catch(nextError(next));
  });

  app.get('/hub/:hubid/story/:story_id/*', csrfProtection, privateHubCheck, (req, res, next) => {

    const hub_id: string = req.params.hubid;
    const story_id: number = parseInt(req.params.story_id || '', 10);
    let user_id: number = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    recordStoryView(req.session, story_id, user_id, next);
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
        return Promise.all([
          Story.getStoryByID(story_id),
          Hub.getHubByID(hub_id)
        ])
          .then((results) => {
            var story = results[0];
            var hub = results[1];
             var image;
            if(story.firstimage){
              image = story.firstimage;
            }
            var description = story.title;
            if(story.firstline){
              description = story.firstline;
            }
            if(!story.published){
              return res.status(401).send("Unauthorized");
            }else{
              return res.render('hubstory', {
                title: story.title,
                description,
                props: {
                  story, hub, canEdit: false
                },
                twitterCard: {
                  title: story.title,
                  description,
                  image,
                  imageType: 'image/jpeg'
                },
                req
              });
            }
          }).catch(nextError(next));
    }else{
      return Story.allowedToModify(story_id, user_id)
      .then((canEdit) => {      
        return Promise.all([
          Story.getStoryByID(story_id),
          Hub.getHubByID(hub_id)
        ])
          .then((results) => {
            var story = results[0];
            var hub = results[1];
             var image;
            if(story.firstimage){
              image = story.firstimage;
            }
            var description = story.title;
            if(story.firstline){
              description = story.firstline;
            }
             if(!story.published && !canEdit){
              return res.status(401).send("Unauthorized");
            }else{
              return res.render('hubstory', {
                title: story.title,
                description,
                props: {
                  story, hub, canEdit
                },
                twitterCard: {
                  title: story.title,
                  description,
                  image,
                  imageType: 'image/jpeg'
                },
                req
              });
            }
          });
      })
      .asCallback((err, result) => {  
        if(err){
          if(err.message && err.message.startsWith('Story not found')){
            return res.redirect('/notfound?path='+req.path);
          }else{
            next(err);
          }
        }else{
          return result;
        }
      });
    }
  });

  app.get('/hub/:hub/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

};
