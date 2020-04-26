
exports.up = async (knex) => {
  await knex.raw(`CREATE TABLE omh.tags (
    tag text,
    PRIMARY KEY (tag)
  )`)
  await knex.raw(`CREATE TABLE omh.story_tags (
    story_id int,
    tag text,
    PRIMARY KEY (story_id, tag),
    CONSTRAINT storytagsstoryfk FOREIGN KEY (story_id)
              REFERENCES omh.stories (story_id),
    CONSTRAINT storytagstagfk FOREIGN KEY (tag)
              REFERENCES omh.tags (tag)
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
  await knex.raw('DROP TABLE omh.story_tags;')
  return knex.raw('DROP TABLE omh.tags;')
}
