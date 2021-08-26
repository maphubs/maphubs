const nanoid = require('nanoid').nanoid
exports.up = async (knex) => {
  await knex.raw(`ALTER TABLE omh.groups ADD COLUMN join_code TEXT`)
  const groups = await knex('omh.groups').select('group_id')
  for (const group of groups) {
    const code = nanoid()
    await knex('omh.groups')
      .where('group_id', group.group_id)
      .update({ join_code: code })
  }
}

exports.down = async (knex) => {
  return knex.raw(`ALTER TABLE omh.groups DROP COLUMN join_code TEXT`)
}
