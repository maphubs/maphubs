// @flow
import slugify from 'slugify'
import type {Layer} from '../types/layer'
import type {CardConfig} from '../components/CardCarousel/Card'
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

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
      group: {
        group_id: layer.owned_by_group_id,
        name: layer.groupname
      },
      type: 'layer',
      link: '/lyr/' + layer_id,
      data: layer,
      private: layer.private,
      onClick
    }
  },

  getMapCard (map: Object, id: number, arr: Array<Object>, onClick?: Function): CardConfig {
    const image_url = `/img/resize/400?url=/api/screenshot/map/thumbnail/${map.map_id}.jpg`
    return {
      id: `map-${map.map_id.toString()}`,
      title: map.title, // LocalizedString
      group: {
        group_id: map.owned_by_group_id,
        name: map.groupname
      },
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

  getStoryCard (story: Object, t: Function) {
    let title = t(story.title)
    title = title
      .replace('<br>', '')
      .replace('<br />', '')
      .replace('<p>', '')
      .replace('</p>', '')
    const baseUrl = urlUtil.getBaseUrl()
    const story_url = `${baseUrl}/story/${slugify(title)}/${story.story_id}`

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
      group: {
        group_id: story.owned_by_group_id,
        name: story.groupname
      },
      data: story
    }
  }

}
