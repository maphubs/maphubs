/* @flow weak */
var passport = require('passport');

var log = require('../services/log.js');
var Changeset = require('../services/changeset');
var apiError = require('../services/error-response').apiError;
var notAllowedError = require('../services/error-response').notAllowedError;

module.exports = function(app) {

  //http://wiki.openstreetmap.org/wiki/API_v0.6#Close:_PUT_.2Fapi.2F0.6.2Fchangeset.2F.23id.2Fclose
  app.put('/changeset/:id/close', passport.authenticate('token', {session: true}), function (req, res) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;

    if (!user_id) {
        res.status(400).send({error: "User not found"});
        return;
    }

    var changesetID = parseInt(req.params.id || '', 10);

    //get changeset and confirm it was created by this user_id
    Changeset.getChangesetById(changesetID)
    .then(function(changeset){
      if(changeset.user_id == user_id){
        //allowed to close this changeset
        return Changeset.closeChangeset(changesetID)
        .then(function(){
          log.info("Closing Changeset: "+ changesetID);
          res.status(200).send();
        });
      }else{
        notAllowedError(res, 'changeset');
      }
    }).catch(apiError(res, 500));

  });
};
