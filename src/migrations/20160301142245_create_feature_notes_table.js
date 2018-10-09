
exports.up = function (knex) {
  return knex.raw(`
      CREATE TABLE omh.feature_notes (
        layer_id int,
        osm_id bigint,
        notes text,
        created_by bigint,
        updated_by bigint,
        created_at timestamp,
        updated_at timestamp,
        CONSTRAINT featurenoteslayersfk FOREIGN KEY (layer_id)
              REFERENCES omh.layers (layer_id),
        PRIMARY KEY (layer_id, osm_id)
      )
  `)
}

exports.down = function (knex) {
  return knex.raw(`DROP TABLE omh.feature_notes`)
}
