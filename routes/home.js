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
      Layer.getFeaturedLayers(5),
      Group.getFeaturedGroups(5),
      Hub.getFeaturedHubs(5),
      Map.getFeaturedMaps(5),
      Story.getFeaturedStories(5),

      Layer.getPopularLayers(5),
      Group.getPopularGroups(5),
      Hub.getPopularHubs(5),
      Map.getPopularMaps(5),
      Story.getPopularStories(5),

      Layer.getRecentLayers(5),
      Group.getRecentGroups(5),
      Hub.getRecentHubs(5),
      Map.getRecentMaps(5),
      Story.getRecentStories(5)
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
