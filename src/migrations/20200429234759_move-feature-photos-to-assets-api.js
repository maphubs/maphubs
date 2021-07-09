exports.up = async (knex) => {
  // add new photo_url field
  await knex.raw(
    'ALTER TABLE omh.feature_photo_attachments ADD COLUMN photo_url TEXT;'
  )
  await knex.raw(
    'ALTER TABLE omh.feature_photo_attachments ADD COLUMN asset_info JSONB;'
  )
  // drop the constrain, we will only use the feature_photo_attachments going forward
  return knex.raw(
    'ALTER TABLE omh.feature_photo_attachments DROP CONSTRAINT featurephotoattachmentsfk;'
  )
}

exports.down = async (knex) => {
  await knex.raw(
    'ALTER TABLE omh.feature_photo_attachments DROP COLUMN photo_url;'
  )
  await knex.raw(
    'ALTER TABLE omh.feature_photo_attachments DROP COLUMN asset_info;'
  )
  return knex.raw(
    'ALTER TABLE omh.feature_photo_attachments ADD CONSTRAINT featurephotoattachmentsfk FOREIGN KEY (photo_id) REFERENCES omh.photo_attachments (photo_id);'
  )
}
