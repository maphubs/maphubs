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
  app.get('/hubs', csrfProtection, async (req, res, next) => {
    try{
      res.render('hubs', {
        title: req.__('Hubs') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          featuredHubs: await Hub.getFeaturedHubs(), 
          popularHubs: await Hub.getPopularHubs(), 
          recentHubs: await Hub.getRecentHubs()
        }, req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/hubs/all', csrfProtection, async (req, res, next) => {
    try{
      res.render('allhubs', {
        title: req.__('Hubs') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          hubs: await Hub.getAllHubs().orderBy('omh.hubs.name')
        }, req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/user/:username/hubs', csrfProtection, (req, res, next) => {

    var username = req.params.username;
    debug.log(username);
    if(!username){nextError(next);}
    var canEdit = false;

    function completeRequest(userCanEdit){
      User.getUserByName(username)
      .then(async(user) => {
        if(user){
          let draftHubs = [];
          if(userCanEdit){
            draftHubs = await Hub.getDraftHubsForUser(user.id);
          }
          return res.render('userhubs', {
            title: 'Hubs - ' + username, 
            props:{user, 
              publishedHubs: await Hub.getPublishedHubsForUser(user.id), 
              draftHubs, 
              canEdit: userCanEdit
            }, req});

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


  var renderHubPage = async function(hub: Object, canEdit: boolean, req, res){
    debug.log(`loading hub, canEdit: ${canEdit.toString()}`);

    let myMaps, popularMaps;
    if(canEdit){
      myMaps = await Map.getUserMaps(req.session.user.maphubsUser.id),
      popularMaps = await Map.getPopularMaps();
    }
    const image = urlUtil.getBaseUrl() + '/hub/' + hub.hub_id + '/images/logo';

    return res.render('hubinfo', {
      title: hub.name + ' - ' + MAPHUBS_CONFIG.productName,
      description: hub.description,
      hideFeedback: !MAPHUBS_CONFIG.mapHubsPro,
      fontawesome: true,
      props: {
        hub, 
        map: await Map.getMap(hub.map_id), 
        layers: await Map.getMapLayers(hub.map_id, canEdit), 
        stories: await Hub.getHubStories(hub.hub_id, canEdit), 
        canEdit, 
        myMaps, 
        popularMaps
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

  app.get('/createhub', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {
    try { 
      const user_id = req.session.user.maphubsUser.id;
      return res.render('hubbuilder', {
        title: req.__('Create Hub') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          groups: await Group.getGroupsForUser(user_id)
        }, req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/hub/:hubid/story/create', login.ensureLoggedIn(), csrfProtection, async (req, res, next) => {
    try{
      const user_id: number = req.session.user.maphubsUser.id;
      const hub_id_input: string = req.params.hubid;
      if(await Hub.allowedToModify(hub_id_input, user_id)){
        const hub = await Hub.getHubByID(hub_id_input);
        const story_id = await Story.createHubStory(hub.hub_id, user_id);        
        return res.render('createhubstory', {
          title: 'Create Story',
          fontawesome: true,
          rangy: true,
          props: {
            hub, 
            myMaps: await Map.getUserMaps(user_id), 
            popularMaps: await Map.getPopularMaps(), 
            story_id
          }, req
        });
      }else{
        return res.redirect(baseUrl + '/unauthorized?path='+req.path);
      }
    }catch(err){nextError(next)(err);}
  });

  app.get('/hub/:hubid/story/:story_id/edit/*', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {
    try{
      const user_id = req.session.user.maphubsUser.id;
      const hub_id = req.params.hubid;
      const story_id = parseInt(req.params.story_id || '', 10);

      if(await Hub.allowedToModify(hub_id, user_id)){
        const story = await Story.getStoryByID(story_id);
        return res.render('edithubstory', {
          title: 'Editing: ' + story.title,
          fontawesome: true,
          rangy: true,
          props: {
            story,
            hub: await Hub.getHubByID(hub_id), 
            myMaps: await Map.getUserMaps(user_id), 
            popularMaps: await Map.getPopularMaps()
          }, req
        });
      }else{
        return res.redirect(baseUrl + '/unauthorized?path='+req.path);
      }
    }catch(err){nextError(next)(err);}
  });

  app.get('/hub/:hubid/story/:story_id/*', csrfProtection, privateHubCheck, async (req, res, next) => {
    try{
      const hub_id: string = req.params.hubid;
      const story_id: number = parseInt(req.params.story_id || '', 10);
      let user_id: number = -1;
      if(req.session.user){
        user_id = req.session.user.maphubsUser.id;
      }
      recordStoryView(req.session, story_id, user_id, next);

      const story = await Story.getStoryByID(story_id);
      const hub = await Hub.getHubByID(hub_id);
     
      let image;
      if(story.firstimage){
        image = story.firstimage;
      }

      let description = story.title;
      if(story.firstline){
        description = story.firstline;
      }

      if (!req.isAuthenticated || !req.isAuthenticated()
          || !req.session || !req.session.user) {
        
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
    }else{
      const canEdit = await Story.allowedToModify(story_id, user_id);
       
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
    }
  }catch(err){
    if(err.message && err.message.startsWith('Story not found')){
      return res.redirect('/notfound?path='+req.path);
    }else{
      next(err);
    }
  }
  });

  app.get('/hub/:hub/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

};
