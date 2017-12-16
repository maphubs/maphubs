// @flow
const Layer = require('../../models/layer');
const Group = require('../../models/group');
const Hub = require('../../models/hub');
const Map = require('../../models/map');
const Page = require('../../models/page');
const Story = require('../../models/story');
const Promise = require('bluebird');
const nextError = require('../../services/error-response').nextError;
const csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.get('/', csrfProtection, (req, res, next) => {

    let useMailChimp = false;

    Page.getPageConfigs(['home']).then((pageConfigs: Object) => {
      const pageConfig = pageConfigs['home'];
      const dataRequests = [];
      const dataRequestNames: Array<string> = [];
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
    
    return Promise.all(dataRequests)
    .then((results) => {
      const props = {pageConfig, _csrf: req.csrfToken()};
      results.forEach((result, i) => {
        props[dataRequestNames[i]] = result;
      });
      let title =  MAPHUBS_CONFIG.productName, description =  MAPHUBS_CONFIG.productName;
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

      return res.render('home', {
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
      const featuredLayers = results[0];
      const featuredGroups = results[1];
      const featuredHubs = results[2];
      const featuredMaps = results[3];
      const featuredStories = results[4];

      const popularLayers = results[5];
      const popularGroups = results[6];
      const popularHubs = results[7];
      const popularMaps = results[8];
      const popularStories = results[9];

      const recentLayers = results[10];
      const recentGroups = results[11];
      const recentHubs = results[12];
      const recentMaps = results[13];
      const recentStories = results[14];
      return res.render('explore', {
        title: req.__('Explore') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          featuredLayers, featuredGroups, featuredHubs, featuredMaps, featuredStories,
          popularLayers, popularGroups, popularHubs, popularMaps, popularStories,
          recentLayers, recentGroups, recentHubs, recentMaps, recentStories
        }, req
      });
    }).catch(nextError(next));
  });

  app.get('/terms', csrfProtection, (req, res) => {
    return res.render('terms', {
      title: req.__('Terms') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {},
      req
    });
  });

  app.get('/privacy', csrfProtection, (req, res) => {
    return res.render('privacy', {
      title: req.__('Privacy') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {},
      req
    });
  });

};
