// @flow
var knex = require('../connection.js');

module.exports = {

  getPageConfig(page_id: string): Promise<Array<Object>> {
    return knex.select('config').from('omh.page').where({page_id})
    .then(function(result) {
      if (result && result.length == 1) {
        return result[0].config;
      }
      //else
      return null;
    });
  },

  savePageConfig(page_id: string, config: string){
    return knex('omh.page').where({page_id}).update({config});
  }
};