var connection = process.env.DATABASE_URL || require('./local').connection.url;
var log = require('./services/log');
var knex = require('knex')({
  client: 'pg',
  connection: connection,
  debug: false,
  pool: {
    min: 2,
    max: 25,
    afterCreate(conn, done) {
      conn.on("error", connectionError =>{
        if(connectionError){
          log.error(connectionError.message);
        }    
      });
      done(null, connection);
    }
  },
  acquireConnectionTimeout: 60000
});
module.exports = knex;