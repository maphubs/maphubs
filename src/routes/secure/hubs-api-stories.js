// @flow
var Story = require('../../models/story');
var Hub = require('../../models/hub');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/hub/:hubid/api/hub/story/create', csrfProtection, function(req, res) {
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
          Story.createHubStory(hub_id, data.title, data.body, data.author, data.firstline, data.firstimage, user_id)
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



};
