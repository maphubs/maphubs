// @flow
var knex = require('../../connection.js');
//var debug = require('../../services/debug')('routes/stories');
var Story = require('../../models/story');
var Hub = require('../../models/hub');
var Image = require('../../models/image');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/api/story/save', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.title && data.body) {
      data.title = data.title.replace('&nbsp;', '');
      Story.allowedToModify(data.story_id, user_id)
      .then((allowed) => {
        if(allowed){
          Story.updateStory(data.story_id, data.title, data.body, data.author, data.firstline, data.firstimage)
            .then((result) => {
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

  app.post('/api/story/publish', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id) {
      Story.allowedToModify(data.story_id, user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction((trx) => {
              return Story.publishStory(data.story_id, trx)
                .then(() => {
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

  app.post('/api/story/delete', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id) {
      Story.allowedToModify(data.story_id, user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction((trx) => {
            return Image.removeAllStoryImages(data.story_id, trx)
              .then(() => {
                return Story.delete(data.story_id, trx)
                  .then(() => {
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

  app.post('/api/story/addimage', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.image) {
      Story.allowedToModify(data.story_id, user_id)
      .then((allowed) => {
        if(allowed){
          Image.addStoryImage(data.story_id, data.image, data.info)
            .then((image_id) => {
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

  app.post('/api/story/removeimage', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.story_id && data.image_id) {
      Story.allowedToModify(data.story_id, user_id)
      .then((allowed) => {
        if(allowed){
          Image.removeStoryImage(data.story_id, data.image_id)
            .then(() => {
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
