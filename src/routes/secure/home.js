// @flow
var Layer = require('../../models/layer');
var Group = require('../../models/group');
var Hub = require('../../models/hub');
var Map = require('../../models/map');
var Page = require('../../models/page');
var Story = require('../../models/story');
var Promise = require('bluebird');
var nextError = require('../../services/error-response').nextError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.get('/', csrfProtection, (req, res, next) => {

    let useMailChimp = false;

    Page.getPageConfigs(['home']).then((pageConfigs: Object) => {
      var pageConfig = pageConfigs['home'];
      var dataRequests = [];
      var dataRequestNames: Array<string> = [];
    //use page config to determine data requests
    if(pageConfig.components && Array.isArray(pageConfig.components) && pageConfig.components.length > 0){
      pageConfig.components.forEach((component: Object) => {
        if(component.type === 'map'){
          dataRequests.push(Map.getMap(component.map_id));
          dataRequestNames.push('map');
          dataRequests.push(Map.getMapLayers(component.map_id, false));
          dataRequestNames.push('layers');

        }else if(component.type === 'storyfeed'){
            dataRequests.push(Story.getPopularStories(5));
            dataRequestNames.push('trendingStories');
            dataRequests.push(Story.getFeaturedStories(5));
            dataRequestNames.push('featuredStories');

        }else if(component.type === 'carousel'){
          if(component.datasets && Array.isArray(component.datasets) && component.datasets.length > 0){
            component.datasets.forEach((dataset) => {
              if(dataset.type === 'layer' && dataset.filter === 'popular'){
                 dataRequests.push(Layer.getPopularLayers(5));
                  dataRequestNames.push('trendingLayers');
              }else if(dataset.type === 'group' && dataset.filter === 'popular'){
                 dataRequests.push(Group.getPopularGroups(5));
                  dataRequestNames.push('trendingGroups');
              }else if(dataset.type === 'hub' && dataset.filter === 'popular'){
                dataRequests.push(Hub.getPopularHubs(5));
                 dataRequestNames.push('trendingHubs');
              }else if(dataset.type === 'map' && dataset.filter === 'popular'){
                dataRequests.push(Map.getPopularMaps(5));
                 dataRequestNames.push('trendingMaps');
              }
            });
          }
        }else if(component.type === 'mailinglist'){
          useMailChimp = true;
        }
      });
    }
    
    Promise.all(dataRequests)
    .then((results) => {
      var props = {pageConfig, _csrf: req.csrfToken()};
      results.forEach((result, i) => {
        props[dataRequestNames[i]] = result;
      });
      var title =  MAPHUBS_CONFIG.productName, description =  MAPHUBS_CONFIG.productName;
      if(pageConfig.title && pageConfig.title[req.locale]){
        title = pageConfig.title[req.locale];
      }else if(pageConfig.title && pageConfig.title.en){
        title = pageConfig.title.en;
      }

      if(pageConfig.description && pageConfig.description[req.locale]){
        description = pageConfig.description[req.locale];
      }else if(pageConfig.description && pageConfig.description.en){
        description = pageConfig.description.en;
      }

      res.render('home', {
        title,
        description,
        mailchimp: useMailChimp,
        props, 
        req
      });
    
      });
    }).catch(nextError(next));
  });

  app.get('/explore', csrfProtection, (req, res, next) => {
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
    ]).then((results) => {
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

  app.get('/services', csrfProtection, (req, res) => {   
    return res.render('services', {
      title: req.__('Services') + ' - ' + MAPHUBS_CONFIG.productName,
      props:{},
      req
    });
  });

  app.get('/journalists', csrfProtection, (req, res) => {
   return res.render('journalists', {
      title: req.__('Maps for Journalists') + ' - ' + MAPHUBS_CONFIG.productName,
      props:{},
      req
    });
  });

};
