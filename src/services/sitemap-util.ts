import slugify from 'slugify'
import Layer from '../models/layer'
import Story from '../models/story'
import Map from '../models/map'
import Group from '../models/group'
import urlUtil from './url-util'
import Bluebird from 'bluebird'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import knex from '../connection'
import moment from 'moment'

export default {
  async getSiteMapIndexFeatureURLs(): Promise<Array<any | string>> {
    const baseUrl = urlUtil.getBaseUrl()
    const layers = await knex('omh.layers').select('layer_id').whereNot({
      is_external: true,
      remote: true
    })
    const urls = []
    await Bluebird.map(
      layers,
      async (layer) => {
        try {
          const count = await Layer.getLayerFeatureCount(layer.layer_id)

          // ignore if layer feature length > 5,000
          if (count > 0 && count < 5000) {
            urls.push(`${baseUrl}/sitemap/sitemap.${layer.layer_id}.xml`)
          }

          return
        } catch (err) {
          log.error(err.message)
        }
      },
      {
        concurrency: 25
      }
    )
    // on larger sites don't queue up too many DB connections at once
    return urls
  },

  async addLayersToSiteMap(sm: any): Promise<any> {
    const baseUrl = urlUtil.getBaseUrl()
    const layers = await Layer.getAllLayers(false)
    for (const layer of layers) {
      let lastmodISO = null
      if (layer.last_updated)
        lastmodISO = moment(layer.last_updated).toISOString()
      sm.write({
        url:
          baseUrl +
          '/layer/info/' +
          layer.layer_id +
          '/' +
          slugify(layer.name.en),
        changefreq: 'weekly',
        lastmodISO
      })
    }
    return sm
  },

  async addStoriesToSiteMap(sm: any): Promise<any> {
    const stories = await Story.getAllStories().orderBy(
      'omh.stories.updated_at',
      'desc'
    )
    for (const story of stories) {
      const title = story.title.en
      const baseUrl = urlUtil.getBaseUrl()
      const story_url = `${baseUrl}/story/${slugify(title)}/${story.story_id}`
      let lastmodISO = null
      if (story.updated_at) lastmodISO = story.updated_at.toISOString()
      sm.write({
        url: story_url,
        changefreq: 'daily',
        lastmodISO
      })
    }
    return sm
  },

  async addMapsToSiteMap(sm: any): Promise<any> {
    const baseUrl = urlUtil.getBaseUrl()
    const maps = await Map.getAllMaps().orderBy('omh.maps.updated_at', 'desc')
    for (const map of maps) {
      const mapUrl = `${baseUrl}/map/view/${map.map_id}/${slugify(
        map.title.en
      )}`
      let lastmodISO = null
      if (map.updated_at) lastmodISO = map.updated_at.toISOString()
      sm.write({
        url: mapUrl,
        changefreq: 'daily',
        lastmodISO
      })
    }
    return sm
  },

  async addGroupsToSiteMap(sm: any): Promise<any> {
    const groups = await Group.getAllGroups()
    for (const group of groups) {
      sm.write({
        url: `${urlUtil.getBaseUrl()}/group/${group.group_id}`,
        changefreq: 'daily'
      })
    }
    return sm
  },

  async addLayerFeaturesToSiteMap(layer_id: number, sm: any): Promise<any> {
    const baseUrl = urlUtil.getBaseUrl()
    const layer = await Layer.getLayerByID(layer_id)

    if (layer && !layer.is_external && !layer.remote && !layer.private) {
      const layer_id = layer.layer_id
      let lastmodISO = null
      if (layer.last_updated)
        lastmodISO = moment(layer.last_updated).toISOString()
      const features = await knex(`layers.data_${layer_id}`).select('mhid')

      if (features && Array.isArray(features)) {
        for (const feature of features) {
          if (feature && feature.mhid) {
            const featureId = feature.mhid.split(':')[1]
            sm.write({
              url: baseUrl + `/feature/${layer_id}/${featureId}/`,
              changefreq: 'weekly',
              lastmodISO
            })
          }
        }
      }

      return sm
    } else {
      return sm
    }
  }
}
