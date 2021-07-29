import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import knex from 'knex'
const connection = knex({
  client: 'pg',
  connection: process.env.DB_CONNECTION,
  debug: false,
  pool: {
    min: 2,
    max: 25,
    afterCreate(conn, done) {
      conn.on('error', (connectionError) => {
        if (connectionError) {
          log.error(connectionError.message)
        }
      })
      done(null, conn)
    }
  },
  acquireConnectionTimeout: 60_000
})
export default connection
