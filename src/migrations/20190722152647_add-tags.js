/* eslint-disable unicorn/prefer-module */
exports.up = async (knex) => {
  await knex.raw(`CREATE TABLE omh.tags (
    tag text,
    PRIMARY KEY (tag)
  )`)
  await knex.raw(`CREATE TABLE omh.map_tags (
    map_id int,
    tag text,
    PRIMARY KEY (map_id, tag),
    CONSTRAINT maptagsmapfk FOREIGN KEY (map_id)
              REFERENCES omh.maps (map_id),
    CONSTRAINT maptagstagfk FOREIGN KEY (tag)
              REFERENCES omh.tags (tag)
  )`)
}

exports.down = async (knex) => {
  await knex.raw('DROP TABLE omh.map_tags;')
  return knex.raw('DROP TABLE omh.tags;')
}
