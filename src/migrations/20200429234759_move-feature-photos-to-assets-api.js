require('@babel/register')
const Bluebird = require('bluebird')
const request = require('superagent')
const MAPHUBS_CONFIG = require('../local')
const Layer = require('../models/layer')
const LayerData = require('../models/layer-data')
const LayerViews = require('../services/layer-views')
const PhotoAttachment = require('../models/photo-attachment')

exports.up = async (knex) => {
  // add new photo_url field
  await knex.raw('ALTER TABLE omh.feature_photo_attachments ADD COLUMN photo_url TEXT;')
  await knex.raw('ALTER TABLE omh.feature_photo_attachments ADD COLUMN asset_info JSONB;')
  // drop the constrain, we will only use the feature_photo_attachments going forward
  await knex.raw('ALTER TABLE omh.feature_photo_attachments DROP CONSTRAINT featurephotoattachmentsfk;')
  // get existing feature photos
  const photos = await knex('omh.feature_photo_attachments').select('omh.feature_photo_attachments.*', 'omh.photo_attachments.data')
    .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
  if (photos && photos.length > 0) {
    console.log(`uploading ${photos.length} photos`)
    return Bluebird.mapSeries(photos, async (photo) => {
      const host = MAPHUBS_CONFIG.host ? MAPHUBS_CONFIG.host.replace(/\./g, '') : 'unknownhost'

      const apiUrl = `${MAPHUBS_CONFIG.ASSET_UPLOAD_API}/image/upload`
      const token = MAPHUBS_CONFIG.ASSET_UPLOAD_API_KEY
      const res = await request.post(apiUrl)
        .set('authorization', token ? `Bearer ${ token }` : null)
        .type('json').accept('json')
        .send({
          image: photo.data,
          options: {
            subfolder: `${host}-features`,
            subfolderID: photo.mhid
          }
        })

      const result = res.body
      console.log(result.webpcheckURL)
      await knex('omh.feature_photo_attachments')
        .update({
          photo_url: result.webpcheckURL,
          asset_info: result
        })
        .where({mhid: photo.mhid})
      const layer = await Layer.getLayerByID(photo.layer_id, knex)
      // add a tag to the feature
      await LayerData.setStringTag(photo.layer_id, photo.mhid, 'photo_url', result.webpcheckURL, knex)

      const presets = await PhotoAttachment.addPhotoUrlPreset(layer, 1, knex)
      await LayerViews.replaceViews(photo.layer_id, presets, knex)
    })
  } else {
    console.log('No photos found')
  }
}

exports.down = async (knex) => {
  await knex.raw('ALTER TABLE omh.feature_photo_attachments DROP COLUMN photo_url;')
  await knex.raw('ALTER TABLE omh.feature_photo_attachments DROP COLUMN asset_info;')
  return knex.raw('ALTER TABLE omh.feature_photo_attachments ADD CONSTRAINT featurephotoattachmentsfk FOREIGN KEY (photo_id) REFERENCES omh.photo_attachments (photo_id);')
}
