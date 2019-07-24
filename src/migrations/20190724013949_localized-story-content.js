
exports.up = async (knex) => {
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN legacy_title text;`)
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN legacy_author text;`)
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN legacy_body text;`)
  await knex.raw(`UPDATE omh.stories SET legacy_title = title;`)
  await knex.raw(`UPDATE omh.stories SET legacy_author = author;`)
  await knex.raw(`UPDATE omh.stories SET legacy_body = body;`)

  await knex.raw(`ALTER TABLE omh.stories DROP COLUMN title;`)
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN title jsonb;`)
  await knex.raw(`UPDATE omh.stories SET title = json_build_object('en', legacy_title);`)

  await knex.raw(`ALTER TABLE omh.stories DROP COLUMN author;`)
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN author jsonb;`)
  await knex.raw(`UPDATE omh.stories SET author = json_build_object('en', legacy_author);`)

  await knex.raw(`ALTER TABLE omh.stories DROP COLUMN body;`)
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN body jsonb;`)
  return knex.raw(`UPDATE omh.stories SET title = json_build_object('en', legacy_body);`)
}

exports.down = (knex) => {
  return null
}
