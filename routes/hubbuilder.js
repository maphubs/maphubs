/* @flow weak */
var Hub = require('../models/hub');

var login = require('connect-ensure-login');
//var debug = require('../services/debug')('routes/hubs');
var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {


  //Views
  app.get('/createhub', login.ensureLoggedIn(), function(req, res) {
    res.render('hubbuilder', {
      title: 'Create Hub - MapHubs',
      props: {}, req
    });
  });

  //API Endpoints
  app.post('/api/hub/checkidavailable', login.ensureLoggedIn(), function(req, res, next) {
    var data = req.body;
    if (data && data.id) {
      Hub.checkHubIdAvailable(data.id)
        .then(function(result) {
          res.send({
            available: result
          });
        }).catch(nextError(next));
    } else {
      res.status(400).send('Bad Request: required data not found');
    }
  });

  app.get('/api/hubs/search/suggestions', function(req, res, next) {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    var q = req.query.q;
    Hub.getSearchSuggestions(q)
      .then(function(result) {
        var suggestions = [];
        result.forEach(function(hub) {
          suggestions.push({key: hub.hub_id, value:hub.name});
        });
        res.send({
          suggestions
        });
      }).catch(nextError(next));
  });

  app.get('/api/hubs/search', function(req, res) {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    Hub.getSearchResults(req.query.q)
      .then(function(result){
        res.status(200).send({hubs: result});
      }).catch(apiError(res, 500));
  });

  app.post('/api/hub/create', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.hub_id) {
      Hub.createHub(data.hub_id, data.name, data.published, user_id)
        .then(function(result) {
          if (result) {
            res.send({
              success: true
            });
          } else {
            res.send({
              success: false,
              error: "Failed to Create Hub"
            });
          }
        }).catch(apiError(res, 500));
    } else {
      res.status(400).send({
        success: false,
        error: 'Bad Request: required data not found'
      });
    }
  });

};
