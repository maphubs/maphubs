// @flow
var Layer = require('../models/layer');
var Hub = require('../models/hub');
var Story = require('../models/story');
var Map = require('../models/map');
var Group = require('../models/group');
import slugify from 'slugify';
var urlUtil = require('./url-util');
var Promise = require('bluebird');
var log = require('./log');

module.exports = {

  getSiteMapIndexFeatureURLs(trx: any){
    var baseUrl = urlUtil.getBaseUrl();
    return trx('omh.layers').select('layer_id')
    .whereNot({
      private: true, is_external: true, remote: true
    })
    .then((layers) => {
      var urls = [];
      return Promise.map(layers, layer => {   
          return Layer.getLayerFeatureCount(layer.layer_id)
          .then(count => {
            //ignore if layer feature length > 10,000
            if(count < 10000){
              urls.push(`${baseUrl}/sitemap.${layer.layer_id}.xml`);
            }
            return;
          }).catch(err => {
            log.error(err.message);
          });
      }).then(()=>{
        return urls;
      });
    });
  },

  addLayersToSiteMap(sm: any, trx: any){
    var baseUrl = urlUtil.getBaseUrl();
    return Layer.getAllLayers(false, trx)
    .then((layers) => {
      layers.forEach((layer) => {
        var lastmodISO = null;
        if(layer.last_updated) lastmodISO = layer.last_updated.toISOString();
        sm.add({
          url: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(layer.name.en),
          changefreq: 'weekly',
          lastmodISO
        });
      });
      return sm;
    });
  },

  addStoriesToSiteMap(sm: any, trx: any){
    return Story.getAllStories(trx).orderBy('omh.stories.updated_at', 'desc')
    .then((stories) => {
      stories.forEach((story) => {
        var title = story.title.replace('&nbsp;', '');
        var story_url = '';
        if(story.display_name){
          var baseUrl = urlUtil.getBaseUrl();
          story_url = baseUrl + '/user/' + story.display_name;
        }else if(story.hub_id){
          story_url ='/hub/' + story.hub_id;
        }
        story_url += '/story/' + story.story_id + '/' + slugify(title);
        var lastmodISO = null;
        if(story.updated_at) lastmodISO = story.updated_at.toISOString();
        sm.add({
          url: story_url,
          changefreq: 'daily',
          lastmodISO
        });
      });
      return sm;
    });
  },

  addHubsToSiteMap(sm: any, trx: any){
    return Hub.getAllHubs(trx)
    .then((hubs) => {
      hubs.forEach((hub) => {
        var baseUrl = urlUtil.getBaseUrl();
        var hubUrl = baseUrl + '/hub/' + hub.hub_id;
        var lastmodISO = null;
        if(hub.updated_at_withTZ) lastmodISO = hub.updated_at_withTZ.toISOString();
        sm.add({
          url: hubUrl,
          changefreq: 'daily',
          lastmodISO
        });
      });
      return sm;
    });
  },

  addMapsToSiteMap(sm: any, trx: any){
    var baseUrl = urlUtil.getBaseUrl();
    return Map.getAllMaps(trx).orderBy('omh.maps.updated_at', 'desc')
    .then((maps) => {
      maps.forEach((map) => {
        var mapUrl =  `${baseUrl}/map/view/${map.map_id}/${slugify(map.title.en)}`;
        var lastmodISO = null;
        if(map.updated_at) lastmodISO = map.updated_at.toISOString();
        sm.add({
          url: mapUrl,
          changefreq: 'daily',
          lastmodISO
        });
      });
      return sm;
    });
  },

  addGroupsToSiteMap(sm: any, trx: any){
    return Group.getAllGroups(trx)
    .then((groups) => {
      groups.forEach((group) => {
        var groupUrl =  urlUtil.getBaseUrl() + '/group/' + group.group_id;
        sm.add({
          url: groupUrl,
          changefreq: 'daily'
        });
      });
      return sm;
    });
  },

  addLayerFeaturesToSiteMap(layer_id: number, sm: any, trx: any){
    //get all layers
    var baseUrl = urlUtil.getBaseUrl();
    return Layer.getLayerByID(layer_id, trx)
    .then((layer) => {
      if(!layer.is_external && !layer.remote && !layer.private){
        let layer_id = layer.layer_id;
        var lastmodISO = null;
        if(layer.last_updated) lastmodISO = layer.last_updated.toISOString();
        return trx(`layers.data_${layer_id}`).select('mhid')
          .then(features => {
            if(features && Array.isArray(features)){
              features.forEach(feature => {
                if(feature && feature.mhid){
                  let featureId = feature.mhid.split(':')[1];
                    sm.add({
                      url: baseUrl + `/feature/${layer_id}/${featureId}/`,
                      changefreq: 'weekly',
                      lastmodISO
                    });
                }
              });         
            }   
            return;         
          })
          .then(() => {
            return sm;
          });
    }else{
      return sm;
    }
  });
  }
};
