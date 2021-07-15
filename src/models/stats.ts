import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('model/stats')

export default {
  async getLayerStats(layer_id: number): Promise<{
    maps: number
    stories: number
    viewsByDay: any
  }> {
    let maps
    const mapsResult = await knex('omh.map_layers')
      .select(knex.raw('count(map_id)'))
      .where({
        layer_id
      })

    if (mapsResult && mapsResult.length === 1) {
      maps = mapsResult[0].count
    }

    let stories
    const storiesResult = await knex
      .select(knex.raw('count(story_id)'))
      .from('omh.story_maps')
      .leftJoin(
        'omh.map_layers',
        'omh.story_maps.map_id',
        'omh.map_layers.map_id'
      )
      .where({
        layer_id
      })

    if (storiesResult && storiesResult.length === 1) {
      stories = storiesResult[0].count
    }

    const viewsByDay = await knex
      .select(
        knex.raw("date_trunc('day', time) as day"),
        knex.raw('count(view_id)')
      )
      .from('omh.layer_views')
      .groupBy(knex.raw("date_trunc('day', time)"))
      .orderBy(knex.raw("date_trunc('day', time)"))
    return {
      maps,
      stories,
      viewsByDay
    }
  },

  async addLayerView(layer_id: number, user_id: any): Promise<any> {
    if (user_id <= 0) {
      user_id = null
    }

    const viewsResult = await knex('omh.layer_views')
      .select(knex.raw('count(view_id)'))
      .where({
        layer_id
      })
    let views: number = Number.parseInt(viewsResult[0].count, 10)
    views = Number.isNaN(views) ? 1 : views + 1
    await knex('omh.layer_views').insert({
      layer_id,
      user_id,
      time: knex.raw('now()')
    })
    debug.log('layer: ' + layer_id + ' now has ' + views + ' views!')
    return knex('omh.layers')
      .update({
        views
      })
      .where({
        layer_id
      })
  },

  async addMapView(map_id: number, user_id: any): Promise<any> {
    if (user_id <= 0) {
      user_id = null
    }

    const viewsResult = await knex('omh.map_views')
      .select(knex.raw('count(view_id)'))
      .where({
        map_id
      })
    let views: number = Number.parseInt(viewsResult[0].count)
    views = Number.isNaN(views) ? 1 : views + 1
    await knex('omh.map_views').insert({
      map_id,
      user_id,
      time: knex.raw('now()')
    })
    debug.log('map: ' + map_id + ' now has ' + views + ' views!')
    return knex('omh.maps')
      .update({
        views
      })
      .where({
        map_id
      })
  },

  async addStoryView(story_id: number, user_id: any): Promise<any> {
    if (user_id <= 0) {
      user_id = null
    }

    const viewsResult = await knex('omh.story_views')
      .select(knex.raw('count(view_id)'))
      .where({
        story_id
      })
    let views: number = Number.parseInt(viewsResult[0].count)
    views = Number.isNaN(views) ? 1 : views + 1
    await knex('omh.story_views').insert({
      story_id,
      user_id,
      time: knex.raw('now()')
    })
    debug.log('story: ' + story_id + ' now has ' + views + ' views!')
    return knex('omh.stories')
      .update({
        views
      })
      .where({
        story_id
      })
  }
}
