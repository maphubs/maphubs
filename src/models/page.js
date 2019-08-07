// @flow
const knex = require('../connection')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = {

  async getPageConfig (page_id: string): Promise<Array<Object>> {
    const result = await knex.select('config').from('omh.page').where({page_id})
    if (result && result.length === 1) {
      return result[0].config
    }
    return null
  },

  async getPageConfigs (page_ids: Array<string>): Promise<Object> {
    const results = await knex.select('page_id', 'config')
      .from('omh.page')
      .whereIn('page_id', page_ids)

    const configs = {}
    results.forEach(result => {
      configs[result.page_id] = result.config
    })
    return configs
  },

  async savePageConfig (page_id: string, config: string) {
    const existingResults = await knex('omh.page').where({page_id}).select('page_id')
    if (existingResults && existingResults.length === 1) {
      log.info(`updating page config for ${page_id}`)
      return knex('omh.page').where({page_id}).update({config})
    } else {
      log.info(`creating new page config for ${page_id}`)
      return knex('omh.page').insert({page_id, config})
    }
  }
}
