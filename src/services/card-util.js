// @flow
var urlUtil = require('./url-util');
import slugify from 'slugify';

import type {Layer} from '../stores/layer-store';
import type {CardConfig} from '../components/CardCarousel/Card';

type CardConfigArray = Array<CardConfig>

module.exports = {


  combineCards(cardDataArray: Array<CardConfigArray>): Array<CardConfig>{
    var output = [];
    cardDataArray.forEach((cardArr: Array<CardConfig>) => {
      output = output.concat(cardArr);
    });
    return output;
  },

  getLayerCard(layer: Layer, id: number, arr: Array<Object>, onClick?: Function): CardConfig{

    let layer_id: number = layer.layer_id ? layer.layer_id: -1;

    var image_url = `/img/resize/400?url=/api/screenshot/layer/thumbnail/${layer_id}.jpg`;
    
    return {
      id: `layer-${layer_id.toString()}`,
      title: layer.name, //LocalizedString
      description: layer.description, //LocalizedString
      image_url,
      source: layer.source,
      group: layer.owned_by_group_id,
      type: 'layer',
      link: '/lyr/' + layer_id,
      data: layer,
      private: layer.private,
      onClick
    };
  },

  getHubCard(hub: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig{
    var title = hub.name.replace('&nbsp;', '');
    var hubUrl = urlUtil.getBaseUrl() + '/hub/' + hub.hub_id;
    return {
      id: `hub-${hub.hub_id}`,
      title,
      description: hub.description,
      group: hub.owned_by_group_id,
      image_url: `/img/resize/150?url=/hub/${hub.hub_id}/images/logo`,
      background_image_url: `/img/resize/400?url=/hub/${hub.hub_id}/images/banner/thumbnail`,
      link: hubUrl,
      type: 'hub',
      data: hub,
      private: hub.private,
      onClick
    };
  },

  getMapCard(map: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig{
    var image_url = `/img/resize/400?url=/api/screenshot/map/thumbnail/${map.map_id}.jpg`;
    return {
      id: `map-${map.map_id.toString()}`,
      title: map.title,//LocalizedString
      group: map.owned_by_group_id,
      image_url,
      link: '/map/view/' + map.map_id + '/',
      type: 'map',
      data: map,
      private: map.private,
      onClick
    };
  },

  getGroupCard(group: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig{
    let image_url;
    if(group.hasimage){
      image_url = `/img/resize/400?url=/group/${group.group_id}/image`;
    }
    return {
      id: `group-${group.group_id}`,
      title: group.name, //LocalizedString
      description: group.description, //LocalizedString
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
    story_url += '/story/' + story.story_id + '/' + slugify(title);

    var image_url;
    if(story.firstimage){
      image_url = story.firstimage.replace(/\/image\//i, '/thumbnail/');
      if(image_url.startsWith(baseUrl)){
        image_url = image_url.replace(baseUrl, '');
      }
      image_url = '/img/resize/400?url=' + image_url;
    }

    return {
      id: `story-${story.story_id.toString()}`,
      title,
      image_url,
      link: story_url,
      type: 'story',
      data: story,
      onClick
    };
  }


};
