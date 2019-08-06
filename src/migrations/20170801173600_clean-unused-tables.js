/* eslint-disable no-console */
exports.up = function (knex) {
  return knex('pg_catalog.pg_statio_user_tables').select('relname').where('relname', 'like', 'node_geom_%')
    .then(result => {
      return Promise.all(result.rows.map(row => {
        return knex.raw(`drop materialized view layers.${row.relname} CASCADE;`)
      })).catch(err => {
        console.log(err.message)
      })
    }).catch(err => {
      console.log(err.message)
    })
}

exports.down = function () {
  return Promise.resolve()
}
