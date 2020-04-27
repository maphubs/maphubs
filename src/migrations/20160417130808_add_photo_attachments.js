
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`
      CREATE TABLE omh.photo_attachments (
        photo_id SERIAL PRIMARY KEY,
        data text,
        info json,
        created_by bigint,
        created_at timestamp,
        CONSTRAINT photoattachmentcreatedbyfk FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `),
    knex.raw(`
      CREATE TABLE omh.feature_photo_attachments (
        layer_id int,
        osm_id bigint,
        photo_id bigint,
        CONSTRAINT featurephotoattachmentsfk FOREIGN KEY (photo_id)
              REFERENCES omh.photo_attachments (photo_id),
        CONSTRAINT photoattachmentlayersfk FOREIGN KEY (layer_id)
              REFERENCES omh.layers (layer_id),
        PRIMARY KEY (layer_id, osm_id, photo_id)
      )
  `)
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('DROP TABLE omh.feature_photo_attachments'),
    knex.raw('DROP TABLE omh.photo_attachments')
  ])
}
