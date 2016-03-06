
exports.up = function(knex, Promise) {

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
        CREATE TABLE omh.story_views (
          view_id SERIAL PRIMARY KEY,
          story_id int,
          user_id bigint,
          time timestamp without time zone,
          CONSTRAINT storyviewsstoriesfk FOREIGN KEY (story_id)
                REFERENCES omh.stories (story_id),
          CONSTRAINT storyviewsuserfk FOREIGN KEY (user_id)
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
    `),
    knex.raw(`
        CREATE TABLE omh.hub_views (
          view_id SERIAL PRIMARY KEY,
          hub_id text,
          user_id bigint,
          time timestamp without time zone,
          CONSTRAINT hubviewshubsfk FOREIGN KEY (hub_id)
                REFERENCES omh.hubs (hub_id),
          CONSTRAINT hubviewsuserfk FOREIGN KEY (user_id)
                REFERENCES users (id)
        )
    `)

  ]);
};

exports.down = function(knex, Promise) {

};
