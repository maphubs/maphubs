
exports.up = async (knex) => {
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN summary jsonb;`)
  return knex.raw(`UPDATE omh.stories SET summary = json_build_object('en', firstline);`)
}

exports.down = async (knex) => {
  return knex.raw(`ALTER TABLE omh.stories DROP COLUMN summary;`)
}
