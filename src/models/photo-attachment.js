// @flow
import MapStyles from '../components/Map/Styles'
const knex = require('../connection')
const Promise = require('bluebird')
const Presets = require('./presets')
const assetUpload = require('../services/asset-upload')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = {

  getPhotosForFeature (layer_id: number, mhid: string, trx: any = null) {
    const db = trx || knex
    return db('omh.feature_photo_attachments')
      .select('photo_url')
      .where({layer_id, mhid})
  },

  async setPhotoAttachment (layer_id: number, mhid: string, data: string, info: Object, user_id: number, trx: any = null) {
    const db = trx || knex
    const results = await db('omh.feature_photo_attachments').where({mhid})
    if (results?.length > 0) {
      // delete previous
      await this.deletePhotoAttachment(mhid, trx)
    }

    // upload to asset API
    const result = await assetUpload(mhid, data)

    const assetInfo = Object.assign({}, info, result)

    await db('omh.feature_photo_attachments')
      .insert({
        layer_id,
        mhid,
        photo_url: result.webpcheckURL,
        asset_info: assetInfo
      })
      .where({mhid})
    return result.webpcheckURL
  },

  async deletePhotoAttachment (layer_id: number, mhid: string, trx: any = null) {
    const db = trx || knex
    return db('omh.feature_photo_attachments').where({mhid}).del()
    // TODO: tell asset API to delete when supported
  },

  // need to call this before deleting a layer
  async removeAllLayerAttachments (layer_id: number, trx: any = null) {
    const db = trx || knex
    return db('omh.feature_photo_attachments').where({layer_id}).del()
  },

  async addPhotoUrlPreset (layer: Object, user_id: number, trx: any) {
    const style = layer.style
    if (style) {
      const firstSource:string = Object.keys(style.sources)[0]

      if (firstSource) {
        const presets = MapStyles.settings.getSourceSetting(style, firstSource, 'presets')
        if (presets) {
          let maxId = 0
          let alreadyPresent = false
          presets.forEach((preset) => {
            if (preset.tag === 'photo_url') {
              alreadyPresent = true
            }
            if (preset.id) {
              if (preset.id > maxId) {
                maxId = preset.id
              }
            }
          })

          if (alreadyPresent) {
            return new Promise((resolve) => {
              resolve(presets)
            })
          } else {
            presets.push({
              tag: 'photo_url',
              label: {en: 'Photo URL'},
              isRequired: false,
              type: 'text',
              id: maxId + 1
            })
            const updatedStyle: Object = MapStyles.settings.setSourceSetting(style, firstSource, 'presets', presets)
            await Presets.savePresets(layer.layer_id, presets, updatedStyle, user_id, false, trx)
            return presets
          }
        } else {
          const msg = 'layer missing style presets'
          log.error(msg)
          throw new Error(msg)
        }
      } else {
        const msg = 'layer missing style sources'
        log.error(msg)
        throw new Error(msg)
      }
    } else {
      const msg = 'layer missing style'
      log.error(msg)
      throw new Error(msg)
    }
  }
}
