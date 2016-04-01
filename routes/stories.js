/* @flow weak */
//var knex = require('../connection.js');
//var debug = require('../services/debug')('routes/stories');
var login = require('connect-ensure-login');
var User = require('../models/user');
var Story = require('../models/story');
var Stats = require('../models/stats');

var Promise = require('bluebird');

var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;


module.exports = function(app) {

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
          title: 'Stories - MapHubs',
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
            res.render('userstories', {title: 'Stories - ' + username, props:{user, stories,  myStories, username}, req});
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

  app.get('/user/createstory', login.ensureLoggedIn(), function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/unauthorized');
    }

    var username = req.session.user.display_name;

    res.render('createuserstory', {
      title: 'Create Story',
      fontawesome: true,
      rangy: true,
      props: {
        username
      }, req
    });

  });

  app.get('/user/:userid/story/:story_id/edit/*', login.ensureLoggedIn(), function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var story_id = parseInt(req.params.story_id || '', 10);
    Story.allowedToModify(story_id, user_id)
    .then(function(allowed){
      if(allowed){
          Story.getStoryByID(story_id)
          .then(function(story) {
            res.render('edituserstory', {
              title: 'Editing: ' + story.title,
              fontawesome: true,
              rangy: true,
              props: {
                story
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

      var user_id = null;
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
            res.render('userstory', {
              title: story.title,
              addthis: true,
              props: {
                story, username, canEdit: false
              }, req
            });
          }).catch(nextError(next));
    } else {
      Story.allowedToModify(story_id, user_id)
      .then(function(allowed){
        var canEdit = false;
        if(allowed){
          canEdit = true;
        }
        Story.getStoryByID(story_id)
        .then(function(story) {
          res.render('userstory', {
            title: story.title,
            addthis: true,
            props: {
              story, username, canEdit
            }, req
          });
        }).catch(nextError(next));
      });

    }
  });



  app.post('/api/user/story/create', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.title && data.body && data.firstline) {
          Story.createUserStory(user_id, data.title, data.body, data.firstline, data.firstimage)
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
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/user/story/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.title && data.body && data.firstline) {
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


  app.post('/api/story/delete', function(req, res) {
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


};
