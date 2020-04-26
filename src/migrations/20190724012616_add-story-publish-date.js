
exports.up = async (knex) => {
  return knex.raw('ALTER TABLE omh.stories ADD COLUMN published_at TIMESTAMP;')
}

exports.down = async (knex) => {
  return knex.raw('ALTER TABLE omh.stories DROP COLUMN published_at;')
}
