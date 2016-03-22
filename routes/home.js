var Layer = require('../models/layer');
var Group = require('../models/group');
var Hub = require('../models/hub');
var Map = require('../models/map');
var Story = require('../models/story');
var Promise = require('bluebird');
var nextError = require('../services/error-response').nextError;

module.exports = function(app) {

  app.get('/', function(req, res, next) {
    Promise.all([
      Layer.getFeaturedLayers(3),
      Group.getFeaturedGroups(3),
      Hub.getFeaturedHubs(3),
      Map.getFeaturedMaps(3),
      Story.getFeaturedStories(3),

      Layer.getPopularLayers(3),
      Group.getPopularGroups(3),
      Hub.getPopularHubs(3),
      Map.getPopularMaps(3),
      Story.getPopularStories(3),

      Layer.getRecentLayers(3),
      Group.getRecentGroups(3),
      Hub.getRecentHubs(3),
      Map.getRecentMaps(3),
      Story.getRecentStories(3)
    ]).then(function(results){
      var featuredLayers = results[0];
      var featuredGroups = results[1];
      var featuredHubs = results[2];
      var featuredMaps = results[3];
      var featuredStories = results[4];

      var popularLayers = results[5];
      var popularGroups = results[6];
      var popularHubs = results[7];
      var popularMaps = results[8];
      var popularStories = results[9];

      var recentLayers = results[10];
      var recentGroups = results[11];
      var recentHubs = results[12];
      var recentMaps = results[13];
      var recentStories = results[14];
      res.render('home', {
        title: 'MapHubs',
        mailchimp: true,
        props: {
          featuredLayers, featuredGroups, featuredHubs, featuredMaps, featuredStories,
          popularLayers, popularGroups, popularHubs, popularMaps, popularStories,
          recentLayers, recentGroups, recentHubs, recentMaps, recentStories
        }, req
      });
    }).catch(nextError(next));
  });

};
