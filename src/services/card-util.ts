import slugify from 'slugify'
import type { Layer } from '../types/layer'
import type { CardConfig } from '../components/CardCarousel/Card'

import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { LocalizedString } from '../types/LocalizedString'

type CardConfigArray = Array<CardConfig>
export default {
  combineCards(cardDataArray: Array<CardConfigArray>): Array<CardConfig> {
    let output = []
    for (const cardArr of cardDataArray) {
      if (cardArr) {
        output = [...output, ...cardArr]
      }
    }
    return output
  },

  getLayerCard(
    layer: Layer,
    id?: number,
    arr?: Array<Record<string, any>>,
    onClick?: (...args: Array<any>) => any
  ): CardConfig {
    const layer_id: number = layer.layer_id ? layer.layer_id : -1
    const image_url = `/api/screenshot/layer/thumbnail/${layer_id}.jpg`
    return {
      id: `layer-${layer_id.toString()}`,
      title: layer.name,
      // LocalizedString
      description: layer.description,
      // LocalizedString
      image_url,
      group: {
        group_id: layer.owned_by_group_id
      },
      type: 'layer',
      link: '/lyr/' + layer_id,
      data: layer,
      onClick
    }
  },

  getMapCard(
    map: Record<string, any>,
    onClick?: (...args: Array<any>) => any
  ): CardConfig {
    const image_url = `/api/screenshot/map/thumbnail/${map.map_id}.jpg`
    return {
      id: `map-${map.map_id.toString()}`,
      title: map.title,
      // LocalizedString
      group: {
        group_id: map.owned_by_group_id
      },
      image_url,
      link: '/map/view/' + map.map_id + '/',
      type: 'map',
      data: map,
      isPublic: map.share_id,
      onClick
    }
  },

  getGroupCard(
    group: Record<string, any>,
    onClick?: (...args: Array<any>) => any
  ): CardConfig {
    let image_url

    if (group.hasimage) {
      image_url = `/api/group/${group.group_id}/image.png`
    }

    return {
      id: `group-${group.group_id}`,
      title: group.name,
      // LocalizedString
      description: group.description,
      // LocalizedString
      image_url,
      link: '/group/' + group.group_id,
      group: group.group_id,
      type: 'group',
      data: group,
      onClick
    }
  },

  getStoryCard(
    story: Record<string, any>,
    t: (v: string | LocalizedString) => string
  ): {
    data: any
    draft: any
    group: {
      group_id: any
      name: any
    }
    id: string
    image_url: any | void | string
    link: string
    title: any
    type: string
  } {
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
      draft: !story.published,
      data: story
    }
  }
}
