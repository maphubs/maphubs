/* @flow weak */
var passport = require('passport');

var log = require('../services/log.js');
var apiError = require('../services/error-response').apiError;
var Changeset = require('../services/changeset');


module.exports = function(app) {

  //http://wiki.openstreetmap.org/wiki/API_v0.6#Create:_PUT_.2Fapi.2F0.6.2Fchangeset.2Fcreate
  app.put('/changeset/create', passport.authenticate('token', {session: true}), function (req, res) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var uid = req.user.id;

    if (!uid) {
      res.status(400).send({error: "User not found"});
      return;
    }

    Changeset.createChangeset(uid)
    .then(function (ids) {
      if(ids.length < 1) {
        throw new Error('Could not add changeset to database.');
      }
      log.info("Created Changeset: "+ ids[0]);
      res.status(200).send(ids[0]);
    }).catch(apiError(res, 500));
  });
};
