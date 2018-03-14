var getenv = require('getenv')
var connection = `postgres://${getenv('DB_USER')}:${getenv('DB_PASS')}@${getenv('DB_HOST')}:${getenv('DB_PORT')}/${getenv('DB_DATABASE')}`
module.exports = {

  development: {
    client: 'pg',
    connection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'pg',
    connection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
