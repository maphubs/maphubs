var Layer = require('../../models/layer');
var Group = require('../../models/group');
var Hub = require('../../models/hub');
var Map = require('../../models/map');
var Story = require('../../models/story');
var Promise = require('bluebird');
var nextError = require('../../services/error-response').nextError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app) {

  app.get('/', csrfProtection, function(req, res, next) {
    Promise.all([
      Layer.getPopularLayers(5),
      Group.getPopularGroups(5),
      Hub.getPopularHubs(5),
      Map.getPopularMaps(5),
      Story.getPopularStories(5),
      Story.getFeaturedStories(5)
    ]).then(function(results){
      var trendingLayers = results[0];
      var trendingGroups = results[1];
      var trendingHubs = results[2];
      var trendingMaps = results[3];
      var trendingStories = results[4];
      var featuredStories = results[5];

      res.render('home', {
        title: MAPHUBS_CONFIG.productName + ' | ' + req.__('A home for the world\'s open data and an easy way to make maps.'),
        description: MAPHUBS_CONFIG.productName + req.__(' is a home for the world\'s open map data and an easy tool for making and sharing maps.'),
        mailchimp: true,
        props: {
          trendingLayers, trendingGroups, trendingHubs, trendingMaps, trendingStories, featuredStories,
          _csrf: req.csrfToken()
        }, req
      });
    }).catch(nextError(next));
  });

  app.get('/explore', csrfProtection, function(req, res, next) {
    Promise.all([
      Layer.getFeaturedLayers(10),
      Group.getFeaturedGroups(10),
      Hub.getFeaturedHubs(10),
      Map.getFeaturedMaps(10),
      Story.getFeaturedStories(10),

      Layer.getPopularLayers(10),
      Group.getPopularGroups(10),
      Hub.getPopularHubs(10),
      Map.getPopularMaps(10),
      Story.getPopularStories(10),

      Layer.getRecentLayers(10),
      Group.getRecentGroups(10),
      Hub.getRecentHubs(10),
      Map.getRecentMaps(10),
      Story.getRecentStories(10)
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
      res.render('explore', {
        title: req.__('Explore') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          featuredLayers, featuredGroups, featuredHubs, featuredMaps, featuredStories,
          popularLayers, popularGroups, popularHubs, popularMaps, popularStories,
          recentLayers, recentGroups, recentHubs, recentMaps, recentStories
        }, req
      });
    }).catch(nextError(next));
  });

  app.get('/services', csrfProtection, function(req, res) {
    res.render('services', {
      title: req.__('Services') + ' - ' + MAPHUBS_CONFIG.productName,
      req
    });
  });

  app.get('/journalists', csrfProtection, function(req, res) {
    res.render('journalists', {
      title: req.__('Maps for Journalists') + ' - ' + MAPHUBS_CONFIG.productName,
      req
    });
  });

};
