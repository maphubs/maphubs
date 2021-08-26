import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('model/stats')

export default {
  async getLayerStats(layer_id: number): Promise<{
    maps: number
    stories: number
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

    return {
      maps,
      stories
    }
  }
}
