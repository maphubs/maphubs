// @flow
const knex = require('../connection')

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
    return knex('omh.page').where({page_id}).update({config})
  }
}
