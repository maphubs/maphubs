const knex = require('../../connection')

const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = function (app: any) {
  app.get('/healthcheck', (req, res) => {
    if (knex) {
      knex
        .select(knex.raw('version()'))
        .then((result) => {
          if (
            result &&
            Array.isArray(result) &&
            result.length === 1 &&
            result[0].version
          ) {
            return res.status(200).send('OK')
          } else {
            return res.status(500).send()
          }
        })
        .catch((err) => {
          log.error(err.message)
          res.status(500).send()
        })
    } else {
      res.status(500).send()
    }
  })
}