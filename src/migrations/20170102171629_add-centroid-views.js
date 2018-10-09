/* eslint-disable no-console */
exports.up = function (knex, Promise) {
  return knex('omh.layers').select('layer_id', 'data_type', 'status').where({status: 'published', is_external: false, remote: false})
    .then((results) => {
      var updates = []
      results.forEach((layer) => {
        if (layer.data_type === 'polygon' && layer.status === 'published') {
          updates.push(knex.raw(`
            CREATE OR REPLACE VIEW layers.centroids_` + layer.layer_id + ` AS
            SELECT st_centroid(geom) as centroid, * FROM layers.polygons_` + layer.layer_id + `
            ;
            `))
          console.log('updating layer: ' + layer.layer_id)
        }
      })
      return Promise.all(updates)
    })
}

exports.down = function () {
  return Promise.resolve()
}
