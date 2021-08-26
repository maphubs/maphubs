import knex from '../connection'

import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

export default {
  async getPageConfig(page_id: string): Promise<Array<Record<string, any>>> {
    const result = await knex.select('config').from('omh.page').where({
      page_id
    })

    if (result && result.length === 1) {
      return result[0].config
    }

    return null
  },

  async getPageConfigs(page_ids: Array<string>): Promise<Record<string, any>> {
    const results = await knex
      .select('page_id', 'config')
      .from('omh.page')
      .whereIn('page_id', page_ids)
    const configs = {}
    for (const result of results) {
      configs[result.page_id] = result.config
    }
    return configs
  },

  async savePageConfig(page_id: string, config: string): Promise<any> {
    const existingResults = await knex('omh.page')
      .where({
        page_id
      })
      .select('page_id')

    if (existingResults && existingResults.length === 1) {
      log.info(`updating page config for ${page_id}`)
      return knex('omh.page')
        .where({
          page_id
        })
        .update({
          config
        })
    } else {
      log.info(`creating new page config for ${page_id}`)
      return knex('omh.page').insert({
        page_id,
        config
      })
    }
  }
}
