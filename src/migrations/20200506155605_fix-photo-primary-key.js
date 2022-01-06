/* eslint-disable unicorn/prefer-module */
exports.up = async (knex) => {
  await knex.raw(
    'ALTER TABLE omh.feature_photo_attachments DROP CONSTRAINT feature_photo_attachments_pkey;'
  )
  await knex.raw(
    'ALTER TABLE omh.feature_photo_attachments DROP COLUMN photo_id;'
  )
  return knex.raw(
    'ALTER TABLE omh.feature_photo_attachments ADD PRIMARY KEY (mhid)'
  )
}

exports.down = (knex) => {
  return null
}
