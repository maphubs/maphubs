
exports.up = function (knex) {
  return knex.raw(`
      CREATE TABLE omh.layer_notes (
        layer_id int,
        notes text,
        created_by bigint,
        updated_by bigint,
        created_at timestamp,
        updated_at timestamp,
        CONSTRAINT layernoteslayersfk FOREIGN KEY (layer_id)
              REFERENCES omh.layers (layer_id),
        PRIMARY KEY (layer_id)
      )
  `)
}

exports.down = function (knex) {
  return knex.raw(`DROP TABLE omh.layer_notes`)
}
