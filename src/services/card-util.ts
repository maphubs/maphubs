import type { Layer } from '../types/layer'
import type { CardConfig } from '../components/CardCarousel/Card'
import urlUtil from './url-util'

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
    const baseUrl = urlUtil.getBaseUrl()
    const image_url = `${baseUrl}/api/screenshot/layer/thumbnail/${layer_id}.jpg`
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

    return {
      id: `group-${group.group_id}`,
      title: group.name,
      // LocalizedString
      description: group.description,
      // LocalizedString
      image_url: `/api/group/${group.group_id}/image.png`,
      link: '/group/' + group.group_id,
      group: group.group_id,
      type: 'group',
      data: group,
      onClick
    }
  },

  getStoryCard(story: Record<string, any>): {
    data: any
    id: string
    image_url: any | void | string
    link: string
    title: any
    type: string
  } {
    // TODO: update to support Ghost
    const title = story.title

    const story_url = ``
    let image_url

    return {
      id: `story-${story.id.toString()}`,
      title,
      image_url,
      link: story_url,
      type: 'story',
      data: story
    }
  }
}
