/* eslint-disable unicorn/prefer-module */

exports.up = function (knex) {
  return Promise.all([
    knex.raw(`
        CREATE TABLE omh.layer_views (
          view_id SERIAL PRIMARY KEY,
          layer_id int,
          user_id bigint,
          time timestamp without time zone,
          CONSTRAINT layerviewslayersfk FOREIGN KEY (layer_id)
                REFERENCES omh.layers (layer_id),
          CONSTRAINT layerviewsuserfk FOREIGN KEY (user_id)
                REFERENCES users (id)
        )
    `),

    knex.raw(`
        CREATE TABLE omh.map_views (
          view_id SERIAL PRIMARY KEY,
          map_id int,
          user_id bigint,
          time timestamp without time zone,
          CONSTRAINT mapviewsmapsfk FOREIGN KEY (map_id)
                REFERENCES omh.maps (map_id),
          CONSTRAINT mapviewsuserfk FOREIGN KEY (user_id)
                REFERENCES users (id)
        )
    `)
  ])
}

exports.down = function () {
  return null
}
