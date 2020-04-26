// @flow
import MapStyles from '../components/Map/Styles'
const knex = require('../connection')
const Promise = require('bluebird')
const Presets = require('./presets')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = {

  async getPhotoAttachment (photo_id: number, trx: any = null) {
    const db = trx || knex
    const result = await db('omh.photo_attachments').where({photo_id})

    if (result && result.length > 0) {
      return result[0]
    }
    return null
  },

  getPhotoIdsForFeature (layer_id: number, mhid: string, trx: any = null) {
    let db = knex
    if (trx) { db = trx }
    return db('omh.feature_photo_attachments').select('omh.photo_attachments.photo_id')
      .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
      .where({layer_id, mhid})
  },

  getPhotoAttachmentsForFeature (layer_id: number, mhid: string, trx: any = null) {
    let db = knex
    if (trx) { db = trx }
    return db('omh.feature_photo_attachments').select('omh.photo_attachments.*')
      .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
      .where({layer_id, mhid})
  },

  async setPhotoAttachment (layer_id: number, mhid: string, data: string, info: string, user_id: number, trx: any = null) {
    const _this = this
    const results = await this.getPhotoAttachmentsForFeature(layer_id, mhid, trx)
    if (results && results.length > 0) {
      // delete previous
      await Promise.map(results, async (result) => {
        return _this.deletePhotoAttachment(layer_id, mhid, result.photo_id, trx)
      })
    }
    return _this.addPhotoAttachment(layer_id, mhid, data, info, user_id, trx)
  },

  async addPhotoAttachment (layer_id: number, mhid: string, data: string, info: string, user_id: number, trx: any = null) {
    const db = trx || knex
    let photo_id = await db('omh.photo_attachments')
      .insert({
        data,
        info,
        created_by: user_id,
        created_at: knex.raw('now()')
      })
      .returning('photo_id')

    photo_id = Number.parseInt(photo_id, 10)
    await db('omh.feature_photo_attachments').insert({layer_id, mhid, photo_id})
    return photo_id
  },

  async updatePhotoAttachment (photo_id: number, data: string, info: string, trx: any = null) {
    const db = trx || knex
    return db('omh.photo_attachments').update({data, info}).where({photo_id})
  },

  async deletePhotoAttachment (layer_id: number, mhid: string, photo_id: number, trx: any = null) {
    const db = trx || knex
    await db('omh.feature_photo_attachments')
      .where({layer_id, mhid, photo_id}).del()
    return db('omh.photo_attachments').where({photo_id}).del()
  },

  // need to call this before deleting a layer
  async removeAllLayerAttachments (layer_id: number, trx: any = null) {
    const _this = this
    const db = trx || knex
    const featurePhotoAttachments = await db('omh.feature_photo_attachments').where({layer_id})
    return Promise.map(featurePhotoAttachments, fpa => {
      return _this.deletePhotoAttachment(layer_id, fpa.mhid, fpa.photo_id)
    })
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
