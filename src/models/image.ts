import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import ImageUtils from '../services/image-utils'
import Bluebird from 'bluebird'
import { Knex } from 'knex'
import { StringDecoder } from 'node:string_decoder'

const debug = DebugService('model/image')

export default {
  async getImageByID(image_id: number): Promise<string | void> {
    const result = await knex('omh.images').select('image_id', 'image').where({
      image_id
    })

    if (result && result.length === 1) {
      return result[0]
    }

    return null
  },

  async getThumbnailImageByID(image_id: number): Promise<string | void> {
    const result = await knex('omh.images')
      .select('image_id', 'thumbnail')
      .where({
        image_id
      })

    if (result && result.length === 1) {
      return result[0]
    }

    // else
    return null
  },

  /// //////////
  // Groups
  /// /////////
  async getGroupImage(group_id: string): Promise<string | void> {
    debug.log('get image for group: ' + group_id)

    const result = await knex('omh.group_images')
      .select('image_id')
      .whereRaw('lower(group_id) = ?', group_id.toLowerCase())

    if (result.length === 1) {
      const id = result[0].image_id
      debug.log('image found: ' + id)
      return this.getImageByID(Number.parseInt(id, 10))
    }

    return null
  },

  async getGroupThumbnail(group_id: string): Promise<string | void> {
    debug.log('get image for group: ' + group_id)
    const result = await knex('omh.group_images')
      .select('image_id')
      .whereRaw('lower(group_id) = ?', group_id.toLowerCase())

    if (result.length === 1) {
      const id = result[0].image_id
      debug.log('image found: ' + id)
      return this.getThumbnailImageByID(Number.parseInt(id, 10))
    } else {
      // throw new Error('No Image Found for Group: '+ group_id);
    }

    return null
  },

  async insertGroupImage(
    group_id: string,
    image: string,
    info: Record<string, unknown>,
    trx: Knex.Transaction
  ): Promise<boolean> {
    const thumbnail = await ImageUtils.resizeBase64(image, 40, 40)
    const image_id: string = await trx('omh.images')
      .insert({
        image,
        thumbnail,
        info
      })
      .returning('image_id')
    return trx('omh.group_images').insert({
      group_id,
      image_id: Number.parseInt(image_id)
    })
  },

  async setGroupImage(
    group_id: string,
    image: string,
    info: Record<string, unknown>
  ): Promise<boolean> {
    return knex.transaction(async (trx) => {
      const result = await trx('omh.group_images')
        .select('image_id')
        .whereRaw('lower(group_id) = ?', group_id.toLowerCase())

      if (result && result.length > 0) {
        // delete the existing group image
        await trx('omh.group_images')
          .where({
            image_id: result[0].image_id
          })
          .del()
        await trx('omh.images')
          .where({
            image_id: result[0].image_id
          })
          .del()
      }

      return this.insertGroupImage(group_id, image, info, trx)
    })
  },

  /// //////////
  // Stories
  /// /////////
  async getStoryImage(
    story_id: number,
    image_id: number
  ): Promise<StringDecoder> {
    debug.log('get image for story: ' + story_id)
    const result = await knex('omh.story_images').select('image_id').where({
      story_id,
      image_id
    })

    if (result.length === 1) {
      debug.log('image found: ' + image_id)
      return this.getImageByID(image_id)
    } else {
      throw new Error('No Image Found for Story: ' + story_id)
    }
  },

  // keep to support deleting legacy stories
  async removeAllStoryImages(
    story_id: number,
    trx: Knex.Transaction
  ): Promise<boolean> {
    const results = await trx('omh.story_images').select('image_id').where({
      story_id
    })
    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    return Bluebird.map(results, async (result) => {
      await trx('omh.story_images')
        .where({
          story_id,
          image_id: result.image_id
        })
        .del()
      return trx('omh.images')
        .where({
          image_id: result.image_id
        })
        .del()
    })
  }
}
