import knex from '../../connection'

import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

export default function (app: any): void {
  app.get('/healthcheck', (req, res) => {
    if (knex) {
      knex
        .select(knex.raw('version()'))
        .then((result) => {
          return result &&
            Array.isArray(result) &&
            result.length === 1 &&
            result[0].version
            ? res.status(200).send('OK')
            : res.status(500).send()
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
