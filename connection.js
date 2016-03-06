var connection = process.env.DATABASE_URL || require('./local').connection.url;
var knex = require('knex')({
  client: 'pg',
  connection: connection,
  debug: false,
  pool: {

    // These are the default settings for PG sql that knex sets.
    // Change these if we get connection pool errors.
    min: 2,
    max: 10
  }
});

module.exports = knex;
