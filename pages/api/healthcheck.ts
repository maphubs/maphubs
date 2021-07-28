import type { NextApiHandler } from 'next'
import knex from '../../src/connection'

const healthCheck: NextApiHandler = async (req, res) => {
  if (knex) {
    try {
      const result = await knex.select(knex.raw('version()'))

      return result &&
        Array.isArray(result) &&
        result.length === 1 &&
        result[0].version
        ? res.status(200).send('OK')
        : res.status(500).send('health check failed')
    } catch {
      res.status(500).send('health check failed')
    }
  } else {
    res.status(500).send('health check failed')
  }
}
export default healthCheck
