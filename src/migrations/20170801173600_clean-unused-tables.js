/* eslint-disable no-console */
exports.up = function (knex, Promise) {
  return knex('pg_catalog.pg_statio_user_tables').select('relname').where('relname', 'like', 'node_geom_%')
    .then(result => {
      return Promise.mapSeries(result.rows, row => {
        return knex.raw(`drop materialized view layers.${row.relname} CASCADE;`)
      }).catch(err => {
        console.log(err.message)
      })
    }).catch(err => {
      console.log(err.message)
    })
}

exports.down = function () {
  return Promise.resolve()
}
