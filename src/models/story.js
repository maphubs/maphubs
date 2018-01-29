// @flow
const knex = require('../connection.js')
const Promise = require('bluebird')
const Group = require('./group')
const debug = require('../services/debug')('model/story')

module.exports = {

  getAllStories (trx: any) {
    const db = trx || knex
    return db.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      db.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      'omh.user_stories.user_id', 'public.users.display_name',
      'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
      db.raw('md5(lower(trim(public.users.email))) as emailhash')
    )
      .table('omh.stories')
    // .where('omh.stories.published', true)
      .whereRaw(`omh.stories.published = true AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true )`)
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
  },

  getRecentStories (number: number = 10) {
    return knex.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      'omh.user_stories.user_id', 'public.users.display_name',
      'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
      knex.raw('md5(lower(trim(public.users.email))) as emailhash')
    )
      .table('omh.stories')
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
      .whereRaw('omh.stories.published=true AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true)')
      .orderBy('omh.stories.updated_at', 'desc')
      .limit(number)
  },

  getPopularStories (number: number = 10) {
    return knex.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      'omh.user_stories.user_id', 'public.users.display_name',
      'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
      knex.raw('md5(lower(trim(public.users.email))) as emailhash')
    )
      .table('omh.stories')
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
      .whereRaw('omh.stories.published=true AND omh.stories.views IS NOT NULL AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true)')
      .orderBy('omh.stories.views', 'desc')
      .limit(number)
  },

  getFeaturedStories (number: number = 10) {
    return knex.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      'omh.user_stories.user_id', 'public.users.display_name',
      'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
      knex.raw('md5(lower(trim(public.users.email))) as emailhash')
    )
      .table('omh.stories')
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
      .whereRaw('omh.stories.published=true AND omh.stories.featured=true AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true)')
      .orderBy('omh.stories.updated_at', 'desc')
      .limit(number)
  },

  getSearchSuggestions (input: string) {
    input = input.toLowerCase()
    return knex.select('title').table('omh.stories')
      .where(knex.raw('lower(title)'), 'like', '%' + input + '%')
  },

  async getStoryByID (story_id: number) {
    const userStoryResult = await this.getUserStoryById(story_id)
    if (userStoryResult && userStoryResult.length > 0) {
      return userStoryResult[0]
    } else {
      const hubStoryResult = await this.getHubStoryById(story_id)
      if (hubStoryResult && hubStoryResult.length > 0) {
        return hubStoryResult[0]
      } else {
        return Promise.resolve()
      }
    }
  },

  getHubStoryById (story_id: number) {
    debug.log('get hub story: ' + story_id)
    const query = knex.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.body', 'omh.stories.language',
      'omh.stories.firstline', 'omh.stories.firstimage',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name'
    )
      .from('omh.stories')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hub_stories.hub_id', 'omh.hubs.hub_id')
      .where({
        'omh.hub_stories.story_id': story_id
      })

    return query
  },

  getUserStories (user_id: number, includeDrafts: boolean = false) {
    debug.log('get stories for user: ' + user_id)
    const query = knex.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
      'omh.user_stories.user_id', 'public.users.display_name'
    )
      .from('omh.stories')
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'omh.user_stories.user_id', 'public.users.id')
    if (!includeDrafts) {
      query.where({
        'omh.user_stories.user_id': user_id,
        'omh.stories.published': true
      })
    } else {
      query.where({
        'public.users.id': user_id
      })
    }
    query.orderBy('updated_at', 'desc')
    return query
  },

  getUserStoryById (story_id: number) {
    debug.log('get user story: ' + story_id)
    const query = knex.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.body', 'omh.stories.language',
      'omh.stories.firstline', 'omh.stories.firstimage',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
      'omh.user_stories.user_id', 'public.users.display_name'
    )
      .from('omh.stories')
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'omh.user_stories.user_id', 'public.users.id')
      .whereNotNull('omh.user_stories.story_id')
      .where({
        'omh.stories.story_id': story_id
      })

    return query
  },

  updateStory (story_id: number, title: string, body: string, author: string, firstline: string, firstimage: any) {
    return knex('omh.stories')
      .where('story_id', story_id)
      .update({
        title,
        body,
        author,
        firstline,
        firstimage,
        updated_at: knex.raw('now()')
      })
  },

  publishStory (story_id: number, trx: any = null) {
    const db = trx || knex
    return db('omh.stories')
      .where('story_id', story_id)
      .update({
        published: true,
        updated_at: db.raw('now()')
      })
  },

  async delete (story_id: number, trx: any) {
    await trx('omh.story_views').where({story_id}).del()
    await trx('omh.story_maps').where({story_id}).del()
    await trx('omh.hub_stories').where({story_id}).del()
    await trx('omh.user_stories').where({story_id}).del()
    return trx('omh.stories').where({story_id}).del()
  },

  async createHubStory (hub_id: string, user_id: number) {
    return knex.transaction(async (trx) => {
      let story_id = await trx('omh.stories').insert({
        user_id,
        published: false,
        created_at: knex.raw('now()'),
        updated_at: knex.raw('now()')
      }).returning('story_id')
      story_id = parseInt(story_id)
      await trx('omh.hub_stories').insert({hub_id, story_id})
      return story_id
    })
  },

  async createUserStory (user_id: number) {
    return knex.transaction(async (trx) => {
      let story_id = await trx('omh.stories').insert({
        user_id,
        published: false,
        created_at: knex.raw('now()'),
        updated_at: knex.raw('now()')
      }).returning('story_id')

      story_id = parseInt(story_id)
      await trx('omh.user_stories').insert({user_id, story_id})
      return story_id
    })
  },

  async allowedToModify (story_id: number, user_id: number) {
    // look in both hub stories and user Stories
    const hubStories = await knex('omh.hub_stories').where({story_id})
    const userStories = await knex('omh.user_stories').where({story_id})

    if (hubStories && hubStories.length > 0) {
      // check if user is allow to modify the hub
      const hub_id = hubStories[0].hub_id
      debug.log('found a hub story in hub: ' + hub_id)
      return this.allowedToModifyHub(hub_id, user_id)
    } else if (userStories && userStories.length > 0) {
      debug.log('found a user story')
      // the story must belong to the requesting user
      if (parseInt(userStories[0].user_id) === parseInt(user_id)) {
        debug.log('user: ' + user_id + ' is the owner of story: ' + story_id)
        return true
      } else {
        debug.log('user: ' + user_id + ' is not the owner of story: ' + story_id)
        return false
      }
    } else {
      // story not found
      throw new Error('Story not found: ' + story_id)
    }
  },

  async getHubByID (hub_id: string) {
    debug.log('get hub: ' + hub_id)
    const hubResult = await knex('omh.hubs')
      .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())

    if (hubResult && hubResult.length === 1) {
      return hubResult[0]
    }
    return null
  },

  async allowedToModifyHub (hub_id: string, user_id: number) {
    debug.log('checking if user: ' + user_id + ' is allowed to modify hub: ' + hub_id)
    const hub = await this.getHubByID(hub_id)
    return Group.allowedToModify(hub.owned_by_group_id, user_id)
  }
}
