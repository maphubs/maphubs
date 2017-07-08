var connection = process.env.DATABASE_URL || require('./local').connection.url;
var knex = require('knex')({
  client: 'pg',
  connection: connection,
  debug: false,
  pool: {
    min: 2,
    max: 20
  },
  acquireConnectionTimeout: 10000
});

module.exports = knex;
