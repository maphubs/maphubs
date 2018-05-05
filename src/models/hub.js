// @flow
const knex = require('../connection.js')
const Promise = require('bluebird')
const _map = require('lodash.map')
const debug = require('../services/debug')('model/hub')
const Story = require('../models/story')
const Image = require('../models/image')
const Group = require('../models/group')

module.exports = {

  /**
   * Can include private?: No
   */
  getAllHubs (trx: any) {
    let db = knex
    if (trx) { db = trx }
    return db.select(
      'omh.hubs.*',
      db.raw('timezone(\'UTC\', omh.hubs.updated_at) as updated_at_withTZ')
    ).table('omh.hubs').where({published: true, private: false})
  },

  /**
   * Can include private?: No
   */
  getRecentHubs (number: number = 15) {
    return knex.select().table('omh.hubs')
      .where({published: true, private: false})
      .orderBy('updated_at', 'desc')
      .limit(number)
  },

  /**
   * Can include private?: No
   */
  getPopularHubs (number: number = 15) {
    return knex.select().table('omh.hubs')
      .where({published: true, private: false})
      .whereNotNull('views')
      .orderBy('views', 'desc')
      .limit(number)
  },

  /**
   * Can include private?: No
   */
  getFeaturedHubs (number: number = 15) {
    return knex.select().table('omh.hubs')
      .where({published: true, featured: true, private: false})
      .orderBy('name')
      .limit(number)
  },

  /**
   * Can include private?: If part of requested hub
   */
  getHubStories (hub_id: string, includeDrafts: boolean = false) {
    debug.log('get stories for hub: ' + hub_id)
    const query = knex.select('omh.stories.story_id', 'omh.stories.title', 'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
      'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language', 'omh.stories.user_id',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'))
      .from('omh.stories')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hub_stories.hub_id', 'omh.hubs.hub_id')
    if (!includeDrafts) {
      query.where({
        'omh.hub_stories.hub_id': hub_id,
        'omh.stories.published': true
      })
    } else {
      query.where({
        'omh.hub_stories.hub_id': hub_id
      })
    }
    return query
  },

  /**
   * Can include private?: No
   */
  getSearchSuggestions (input: string) {
    input = input.toLowerCase()
    return knex.select('name')
      .table('omh.hubs')
      .where(knex.raw(`
    private = false AND published = true
    AND (
    to_tsvector('english', hub_id
      || ' ' || name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('spanish', hub_id
      || ' ' || name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('french', hub_id
      || ' ' || name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('italian', hub_id
      || ' ' || name
      || ' ' || COALESCE(description, '')
      || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
      )
      `, {input}))
      .orderBy('name')
  },

  /**
     * Can include private?: No
     */
  getSearchResults (input: string) {
    input = input.toLowerCase()
    return knex.select().table('omh.hubs')
      .where({published: true, private: false})
      .where(knex.raw(`
       private = false AND published = true
        AND (
        to_tsvector('english', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('spanish', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('french', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('italian', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery(:input)
        )
        `, {input}))

      .orderBy('name')
  },

  /**
     * Can include private?: If Requested
     */
  async getHubByID (hub_id: string, trx: any) {
    const db = trx || knex
    debug.log('get hub: ' + hub_id)
    const hubResult = await db('omh.hubs')
      .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())

    if (hubResult && hubResult.length === 1) {
      const imagesResult = await db('omh.hub_images').select().distinct('type')
        .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())

      const hub = hubResult[0]
      let hasLogoImage = false
      let hasBannerImage = false
      if (imagesResult && imagesResult.length > 0) {
        imagesResult.forEach((result) => {
          if (result.type === 'logo') {
            hasLogoImage = true
          } else if (result.type === 'banner') {
            hasBannerImage = true
          }
        })
      }

      hub.hasLogoImage = hasLogoImage
      hub.hasBannerImage = hasBannerImage
      return hub
    }
    return null
  },

  /**
     * Can include private?: Yes
     */
  getPublishedHubsForUser (user_id: number) {
    debug.log('get hubs for user: ' + user_id)
    return knex.select().from('omh.hubs')
      .whereIn('owned_by_group_id',
        knex.select('group_id').from('omh.group_memberships').where({user_id}))
      .where({'omh.hubs.published': true})
      .orderBy('name')
  },

  /**
     * Can include private?: Yes
     */
  getDraftHubsForUser (user_id: number) {
    debug.log('get hubs for user: ' + user_id)
    return knex.select().from('omh.hubs')
      .whereIn('owned_by_group_id',
        knex.select('group_id').from('omh.group_memberships').where({user_id}))
      .where({'omh.hubs.published': false})
      .orderBy('name')
  },

  /**
     * Can include private?: If Requested
     */
  getGroupHubs (group_id: string, includePrivate: boolean = false) {
    const query = knex.select().from('omh.hubs').orderBy('name')
    if (includePrivate) {
      query.where('owned_by_group_id', group_id)
    } else {
      query.where({
        'published': true,
        'private': false,
        'owned_by_group_id': group_id
      })
    }
    return query
  },

  async isPrivate (hub_id: string) {
    const result = await knex.select('private').from('omh.hubs')
      .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())
    if (result && result.length === 1) {
      return result[0].private
    }
    return true // if we don't find the layer, assume it should be private
  },

  async allowedToModify (hub_id: string, user_id?: number) {
    debug.log('checking if user: ' + user_id + ' is allowed to modify hub: ' + hub_id)
    if (!user_id) return false
    const hub = await this.getHubByID(hub_id)
    return Group.allowedToModify(hub.owned_by_group_id, user_id)
  },

  /**
   * Can include private?: Yes
   */
  async checkHubIdAvailable (hub_id: string) {
    const result = await this.getHubByID(hub_id)
    if (result === null) return true
    return false
  },

  createHub (hub_id: string, group_id: string, name: string, published: boolean, isPrivate: boolean, user_id: number) {
    hub_id = hub_id.toLowerCase()
    return knex.transaction((trx) => {
      return trx('omh.hubs').insert({
        hub_id,
        name,
        published,
        private: isPrivate,
        owned_by_group_id: group_id,
        created_by: user_id,
        created_at: knex.raw('now()'),
        updated_by: user_id,
        updated_at: knex.raw('now()')
      })
    })
  },

  updateHub (hub_id: string, name: string, description: string, tagline: string, published: boolean, resources: string, about: string, map_id: number, user_id: number) {
    // TODO add option to change hub_id
    return knex('omh.hubs')
      .where('hub_id', hub_id)
      .update({
        name,
        description,
        tagline,
        published,
        resources,
        about,
        map_id,
        updated_by: user_id,
        updated_at: knex.raw('now()')
      })
  },

  publishHub (hub_id: string, user_id: number) {
    return knex('omh.hubs')
      .where('hub_id', hub_id)
      .update({
        published: true,
        updated_by: user_id,
        updated_at: knex.raw('now()')
      })
  },

  setPrivate (hub_id: string, isPrivate: boolean, user_id: number) {
    return knex('omh.hubs')
      .where('hub_id', hub_id)
      .update({
        private: isPrivate,
        updated_by: user_id,
        updated_at: knex.raw('now()')
      })
  },

  transferHubToGroup (hub_id: string, group_id: string, user_id: number) {
    return knex('omh.hubs')
      .update({
        owned_by_group_id: group_id,
        updated_by: user_id,
        updated_at: knex.raw('now()')
      })
      .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())
  },

  async deleteHub (hub_id_input: string) {
    const _this = this
    return knex.transaction(async (trx) => {
      const hub = await _this.getHubByID(hub_id_input, trx)
      const hub_id = hub.hub_id

      const imageIdResult = await trx('omh.hub_images')
        .leftJoin('omh.group_images', 'omh.hub_images.image_id', 'omh.group_images.image_id')
        .select('omh.hub_images.image_id')
        .where({hub_id}).whereNull('omh.group_images.image_id')

      const storyIds = await trx('omh.hub_stories').select('story_id').where({hub_id})

      return Promise.each(storyIds, async (storyResult) => {
        const story_id = storyResult.story_id
        debug.log('Deleting Hub Story: ' + story_id)
        await Image.removeAllStoryImages(story_id, trx)
        await Story.delete(story_id, trx)

        if (imageIdResult.length > 0) {
          const imageIds = _map(imageIdResult, 'image_id')
          await trx('omh.hub_images').where('hub_id', hub_id).delete()
          await trx('omh.images').whereIn('image_id', imageIds).delete()
        }
        await trx('omh.hub_views').where('hub_id', hub_id).delete()
        await trx('omh.hub_layers').where('hub_id', hub_id).delete() // keep until table is removed
        await trx('omh.hubs').where('hub_id', hub_id).delete()
      })
    })
  }
}
