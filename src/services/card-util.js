// @flow
import slugify from 'slugify'
import type {Layer} from '../types/layer'
import type {CardConfig} from '../components/CardCarousel/Card'
const urlUtil = require('./url-util')

type CardConfigArray = Array<CardConfig>

export default {

  combineCards (cardDataArray: Array<CardConfigArray>): Array<CardConfig> {
    let output = []
    cardDataArray.forEach((cardArr: Array<CardConfig>) => {
      output = output.concat(cardArr)
    })
    return output
  },

  getLayerCard (layer: Layer, id: number, arr: Array<Object>, onClick?: Function): CardConfig {
    const layer_id: number = layer.layer_id ? layer.layer_id : -1

    const image_url = `/img/resize/400?url=/api/screenshot/layer/thumbnail/${layer_id}.jpg`

    return {
      id: `layer-${layer_id.toString()}`,
      title: layer.name, // LocalizedString
      description: layer.description, // LocalizedString
      image_url,
      group: layer.owned_by_group_id,
      type: 'layer',
      link: '/lyr/' + layer_id,
      data: layer,
      private: layer.private,
      onClick
    }
  },

  getHubCard (hub: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig {
    const title = hub.name.replace('&nbsp;', '')
    const hubUrl = urlUtil.getBaseUrl() + '/hub/' + hub.hub_id
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
    }
  },

  getMapCard (map: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig {
    const image_url = `/img/resize/400?url=/api/screenshot/map/thumbnail/${map.map_id}.jpg`
    return {
      id: `map-${map.map_id.toString()}`,
      title: map.title, // LocalizedString
      group: map.owned_by_group_id,
      image_url,
      link: '/map/view/' + map.map_id + '/',
      type: 'map',
      data: map,
      private: map.private,
      public: map.share_id,
      onClick
    }
  },

  getGroupCard (group: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig {
    let image_url
    if (group.hasimage) {
      image_url = `/img/resize/400?url=/group/${group.group_id}/image`
    }
    return {
      id: `group-${group.group_id}`,
      title: group.name, // LocalizedString
      description: group.description, // LocalizedString
      image_url,
      link: '/group/' + group.group_id,
      group: group.group_id,
      type: 'group',
      data: group,
      onClick
    }
  },

  getStoryCard (story: Object, id: number, arr: Array<Object>, onClick?: Function) {
    const title = story.title.replace('&nbsp;', '')
    let story_url = ''
    const baseUrl = urlUtil.getBaseUrl()
    if (story.display_name) {
      story_url = baseUrl + '/user/' + story.display_name
    } else if (story.hub_id) {
      const hubUrl = baseUrl + '/hub/' + story.hub_id
      story_url = hubUrl
    }
    story_url += '/story/' + story.story_id + '/' + slugify(title)

    let image_url
    if (story.firstimage) {
      image_url = story.firstimage.replace(/\/image\//i, '/thumbnail/')
      if (image_url.startsWith(baseUrl)) {
        image_url = image_url.replace(baseUrl, '')
      }
      image_url = '/img/resize/400?url=' + image_url
    }

    return {
      id: `story-${story.story_id.toString()}`,
      title,
      image_url,
      link: story_url,
      type: 'story',
      data: story,
      onClick
    }
  }

}
