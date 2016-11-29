// @flow
//var debug = require('../../services/debug')('routes/stories');
var login = require('connect-ensure-login');
var User = require('../../models/user');
var Story = require('../../models/story');
var Stats = require('../../models/stats');
var Map = require('../../models/map');
var Promise = require('bluebird');
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  //Views
  app.get('/stories', function(req, res, next) {
    Promise.all([
      Story.getPopularStories(10),
      Story.getFeaturedStories(10)
    ])
      .then(function(results) {
        var popularStories = results[0];
        var featuredStories = results[1];
        res.render('stories', {
          title: req.__('Stories') + ' - ' + MAPHUBS_CONFIG.productName,
          addthis: true,
          props: {
            popularStories, featuredStories
          }, req
        });
      }).catch(nextError(next));
  });

  app.get('/user/:username/stories', function(req, res, next) {

    var username = req.params.username;
    if(!username){apiDataError(res);}
    var myStories = false;

    function completeRequest(){

      User.getUserByName(username)
      .then(function(user){
        if(user){
          return Story.getUserStories(user.id)
          .then(function(stories){
            res.render('userstories', {title: 'Stories - ' + username,
            addthis: true,
            props:{user, stories,  myStories, username}, req});
          });
        }else{
          res.redirect('/notfound?path='+req.path);
        }
      }).catch(nextError(next));
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          completeRequest();
    } else {
      //get user id
      var user_id = req.session.user.id;

      //get user for logged in user
      User.getUser(user_id)
      .then(function(user){
        //flag if requested user is logged in user
        if(user.display_name === username){
          myStories = true;
        }
        completeRequest();
      }).catch(nextError(next));
    }
  });

  app.get('/user/createstory', login.ensureLoggedIn(), csrfProtection, function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/unauthorized');
    }

    var username = req.session.user.display_name;
    Promise.all([
      Map.getUserMaps(req.session.user.id),
      Map.getPopularMaps()
    ]).then(function(results){
      var myMaps = results[0];
      var popularMaps = results[1];

      res.render('createuserstory', {
        title: 'Create Story',
        fontawesome: true,
        rangy: true,
        props: {
          username, myMaps, popularMaps
        }, req
      });
    }).catch(nextError(next));

  });

  app.get('/user/:userid/story/:story_id/edit/*', login.ensureLoggedIn(), csrfProtection, function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var story_id = parseInt(req.params.story_id || '', 10);
    Story.allowedToModify(story_id, user_id)
    .then(function(allowed){
      if(allowed){
          Promise.all([
            Story.getStoryByID(story_id),
            Map.getUserMaps(req.session.user.id),
            Map.getPopularMaps()
          ]).then(function(results) {
            var story = results[0];
            var myMaps = results[1];
            var popularMaps = results[2];
            res.render('edituserstory', {
              title: 'Editing: ' + story.title,
              fontawesome: true,
              rangy: true,
              props: {
                story, myMaps, popularMaps
              }, req
            });
          }).catch(nextError(next));
      }else{
        res.redirect('/unauthorized');
      }
    }).catch(nextError(next));
  });

  app.get('/user/:username/story/:story_id/*', function(req, res, next) {

    var story_id = parseInt(req.params.story_id || '', 10);
    var username = req.params.username;

      var user_id = -1;
      if ( (req.isAuthenticated || req.isAuthenticated())
          && req.session && req.session.user) {
            user_id = req.session.user.id;
      }

      if(!req.session.storyviews){
        req.session.storyviews = {};
      }
      if(!req.session.storyviews[story_id]){
        req.session.storyviews[story_id] = 1;
        Stats.addStoryView(story_id, user_id).catch(nextError(next));
      }else{
        var views = req.session.storyviews[story_id];

        req.session.storyviews[story_id] = views + 1;
      }

      req.session.views = (req.session.views || 0) + 1;

    if (!user_id) {
          Story.getStoryByID(story_id)
          .then(function(story) {
             var imageUrl = '';
            if(story.firstimage){
              imageUrl = story.firstimage;
            }
            res.render('userstory', {
              title: story.title,
              addthis: true,
              props: {
                story, username, canEdit: false
              },
              twitterCard: {
                title: story.title,
                description: story.firstline,
                image: imageUrl
              },
              req
            });
          }).catch(nextError(next));
    } else {
      Story.allowedToModify(story_id, user_id)
      .then(function(canEdit){       
        Story.getStoryByID(story_id)
        .then(function(story) {
           var imageUrl = '';
            if(story.firstimage){
              imageUrl = story.firstimage;
            }
          res.render('userstory', {
            title: story.title,
            addthis: true,
            props: {
              story, username, canEdit
            },
            twitterCard: {
                title: story.title,
                description: story.firstline,
                image: imageUrl
            }, req
          });
        }).catch(nextError(next));
      });
    }
  });
};