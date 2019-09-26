
exports.up = async (knex) => {
  return knex.raw('UPDATE omh.stories SET published_at = updated_at WHERE published_at IS NULL;')
}

exports.down = async (knex) => {
  //
}
