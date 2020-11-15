// @flow
const knex = require('../connection')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = {
  async checkIfExists (tag: string, trx?: any): Promise<boolean> {
    const db = trx || knex
    const result = await db('omh.tags').select('tag').where({tag})
    if (result && result.length > 0) {
      return true
    }
    return false
  },

  async addTag (tag: string, trx?: any): Promise<any> | Promise<boolean> {
    const db = trx || knex
    if (await this.checkIfExists(tag, db)) {
      return true
    } else {
      return db('omh.tags').insert({tag})
    }
  },

  async addStoryTag (tag: string, story_id: number, trx?: any): Promise<any> {
    const db = trx || knex
    await this.addTag(tag, db)
    return db('omh.story_tags').insert({story_id, tag})
  },

  async updateStoryTags (tags: Array<string>, story_id: number, trx?: any): Promise<Array<$Call<<T>(p: Promise<T> | T) => T, mixed>>> {
    const db = trx || knex
    log.info(`updating tags for story: ${story_id}`)
    const results = await db('omh.story_tags').select('tag').where({story_id})
    const existingTags = results.map(result => result.tag)
    const tagsToAdd = []
    const tagsToRemove = []
    tags.forEach(tag => {
      if (!existingTags.includes(tag)) {
        // need to add it
        tagsToAdd.push(tag)
      }
    })
    existingTags.forEach(tag => {
      if (!tags.includes(tag)) {
        // need to remove it
        tagsToRemove.push(tag)
      }
    })
    log.info(`removing tags ${tagsToRemove.toString()} from story ${story_id}`)
    await db('omh.story_tags').del()
      .whereIn('tag', tagsToRemove)
      .andWhere({story_id})
    return Promise.all(tagsToAdd.map(tagToAdd => {
      log.info(`adding tag ${tagToAdd} to story ${story_id}`)
      return this.addStoryTag(tagToAdd, story_id, db)
    }))
  },

  async updateMapTags (tags: Array<string>, map_id: number, trx?: any): Promise<Array<$Call<<T>(p: Promise<T> | T) => T, mixed>>> {
    const db = trx || knex
    log.info(`updating tags for map: ${map_id}`)
    const results = await db('omh.map_tags').select('tag').where({map_id})
    const existingTags = results.map(result => result.tag)
    const tagsToAdd = []
    const tagsToRemove = []
    tags.forEach(tag => {
      if (!existingTags.includes(tag)) {
        // need to add it
        tagsToAdd.push(tag)
      }
    })
    existingTags.forEach(tag => {
      if (!tags.includes(tag)) {
        // need to remove it
        tagsToRemove.push(tag)
      }
    })
    log.info(`removing tags ${tagsToRemove.toString()} from map ${map_id}`)
    await db('omh.map_tags').del()
      .whereIn('tag', tagsToRemove)
      .andWhere({map_id})
    return Promise.all(tagsToAdd.map(tagToAdd => {
      log.info(`adding tag ${tagToAdd} to map ${map_id}`)
      return this.addMapTag(tagToAdd, map_id, db)
    }))
  },

  async addMapTag (tag: string, map_id: number, trx?: any): Promise<any> {
    const db = trx || knex
    await this.addTag(tag, db)
    return db('omh.map_tags').insert({map_id, tag})
  }
}
