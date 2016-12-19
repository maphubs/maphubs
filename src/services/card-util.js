// @flow
var urlUtil = require('./url-util');
var slug = require('slug');

module.exports = {


  combineCards(cardDataArray: Array<Object>): Array<Object>{
    var output = [];
    cardDataArray.forEach(function(cardArr){
      output = output.concat(cardArr);
    });
    return output;
  },

  getLayerCard(layer: Object, id: number, arr: Array<Object>, onClick?: Function){
    var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';
    return {
      id: layer.layer_id.toString(),
      title: layer.name,
      description: layer.description,
      image_url,
      source: layer.source,
      group: layer.owned_by_group_id,
      type: 'layer',
      link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name),
      data: layer,
      onClick
    };
  },

  getHubCard(hub: Object, id: number, arr: Array<Object>, onClick?: Function){
    var title = hub.name.replace('&nbsp;', '');
    var hubUrl = urlUtil.getBaseUrl() + '/hub/' + hub.hub_id;
    return {
      id: hub.hub_id,
      title,
      description: hub.description,
      group: hub.owned_by_group_id,
      image_url: '/hub/' + hub.hub_id + '/images/logo',
      background_image_url: '/hub/' + hub.hub_id + '/images/banner/thumbnail',
      link: hubUrl,
      type: 'hub',
      data: hub,
      onClick
    };
  },

  getMapCard(map: Object, id: number, arr: Array<Object>, onClick?: Function){
    var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.jpg';
    return {
      id: map.map_id.toString(),
      title: map.title ? map.title : '',
      image_url,
      link: '/user/' + map.username + '/map/' + map.map_id,
      type: 'map',
      data: map,
      onClick
    };
  },

  getGroupCard(group: Object, id: number, arr: Array<Object>, onClick?: Function){
    var image_url = null;
    if(group.hasimage){
      image_url = '/group/' + group.group_id + '/image';
    }
    return {
      id: group.group_id,
      title: group.name,
      description: group.description,
      image_url,
      link: '/group/' + group.group_id,
      group: group.group_id,
      type: 'group',
      data: group,
      onClick
    };
  },


  getStoryCard(story: Object, id: number, arr: Array<Object>, onClick?: Function){
    var title = story.title.replace('&nbsp;', '');
    var story_url = '';
    var baseUrl = urlUtil.getBaseUrl();
    if(story.display_name){
      story_url = baseUrl + '/user/' + story.display_name;
    }else if(story.hub_id){
      var hubUrl = baseUrl + '/hub/' + story.hub_id;
      story_url = hubUrl;
    }
    story_url += '/story/' + story.story_id + '/' + slug(title);

    var image_url = null;
    if(story.firstimage){
      image_url = story.firstimage.replace(/\/image\//i, '/thumbnail/');
    }

    return {
      id: story.story_id.toString(),
      title,
      image_url,
      link: story_url,
      type: 'story',
      data: story,
      onClick
    };
  }


};
