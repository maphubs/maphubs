/* eslint-disable unicorn/prefer-module */
exports.up = (knex) => {
  return Promise.all([
    knex.raw(
      "CREATE INDEX layers_text_search_idx ON omh.layers USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(source, '')));"
    ),
    knex.raw(
      "CREATE INDEX groups_text_search_idx ON omh.groups USING GIN (to_tsvector('english', group_id || ' ' || name || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, '')));"
    ),
    knex.raw(
      "CREATE INDEX maps_text_search_idx ON omh.maps USING GIN (to_tsvector('english', title));"
    )
  ])
}

exports.down = () => {
  return Promise.resolve()
}
