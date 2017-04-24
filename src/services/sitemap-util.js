// @flow
var Layer = require('../models/layer');
var Hub = require('../models/hub');
var Story = require('../models/story');
var Map = require('../models/map');
var Group = require('../models/group');
var slug = require('slug');
var urlUtil = require('./url-util');

module.exports = {

  addLayersToSiteMap(sm: any){
    var baseUrl = urlUtil.getBaseUrl();
    return Layer.getAllLayers()
    .then((layers) => {
      layers.forEach((layer) => {
        var lastmodISO = null;
        if(layer.last_updated) lastmodISO = layer.last_updated.toISOString();
        sm.add({
          url: baseUrl + '/layer/info/' + layer.layer_id + '/' + slug(layer.name),
          changefreq: 'weekly',
          lastmodISO
        });
      });
      return sm;
    });
  },

  addStoriesToSiteMap(sm: any){
    return Story.getAllStories()
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
        story_url += '/story/' + story.story_id + '/' + slug(title);
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

  addHubsToSiteMap(sm: any){
    return Hub.getAllHubs()
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

  addMapsToSiteMap(sm: any){
    return Map.getAllMaps()
    .then((maps) => {
      maps.forEach((map) => {
        var mapUrl =  urlUtil.getBaseUrl() + '/user/' + map.username + '/map/' + map.map_id;
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

  addGroupsToSiteMap(sm: any){
    return Group.getAllGroups()
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
  }
};
