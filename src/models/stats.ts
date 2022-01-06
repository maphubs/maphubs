import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('model/stats')

export default {
  async getLayerStats(layer_id: number): Promise<{
    maps: number
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

    return {
      maps
    }
  }
}
