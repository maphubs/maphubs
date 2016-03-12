var Layer = require('../models/layer');
var Group = require('../models/group');
var Hub = require('../models/hub');
var Promise = require('bluebird');
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {

  app.get('/', function(req, res, next) {
    Promise.all([
      Layer.getFeaturedLayers(10),
      Group.getFeaturedGroups(10),
      Hub.getFeaturedHubs(10)
    ]).then(function(results){
      var featuredLayers = results[0];
      var featuredGroups = results[1];
      var featuredHubs = results[2];
      res.render('home', {title: 'MapHubs',
      props: {
        featuredLayers, featuredGroups, featuredHubs
      }, req});
    }).catch(nextError(next));

  });

};
