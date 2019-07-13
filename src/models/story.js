// @flow
const knex = require('../connection')
const Group = require('./group')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('model/story')

module.exports = {

  getStoriesBaseQuery (trx) {
    const db = trx || knex
    return db.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.body', 'omh.stories.language',
      'omh.stories.firstline', 'omh.stories.firstimage',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw(`timezone('UTC', omh.stories.updated_at) as updated_at`),
      'omh.stories.owned_by_group_id',
      'omh.groups.name as groupname'
    )
      .from('omh.stories')
      .leftJoin('omh.groups', 'omh.stories.owned_by_group_id', 'omh.groups.group_id')
  },

  getAllStories (trx: any) {
    const query = this.getStoriesBaseQuery(trx)
    return query
      .where('omh.stories.published', true)
  },

  getGroupStories (group_id: string, trx?: any) {
    const query = this.getStoriesBaseQuery(trx)
    return query
      .where('omh.stories.owned_by_group_id', group_id)
  },

  getRecentStories (number: number = 10) {
    const query = this.getStoriesBaseQuery()
    return query
      .where('omh.stories.published', true)
      .orderBy('omh.stories.updated_at', 'desc')
      .limit(number)
  },

  getPopularStories (number: number = 10) {
    const query = this.getStoriesBaseQuery()
    return query
      .where('omh.stories.published', true)
      .orderBy('omh.stories.views', 'desc')
      .limit(number)
  },

  getFeaturedStories (number: number = 10) {
    const query = this.getStoriesBaseQuery()
    return query
      .where('omh.stories.published', true)
      .andWhere('omh.stories.featured', true)
      .orderBy('omh.stories.updated_at', 'desc')
      .limit(number)
  },

  getSearchSuggestions (input: string) {
    input = input.toLowerCase()
    return knex.select('title').table('omh.stories')
      .where(knex.raw('lower(title)'), 'like', '%' + input + '%')
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

  async getStoryById (story_id: number) {
    debug.log('get story: ' + story_id)
    const query = this.getStoriesBaseQuery()
      .where({
        'omh.stories.story_id': story_id
      })

    const result = await query
    if (result && result.length === 1) {
      return result[0]
    }
    return null
  },

  updateStory (story_id: number, data: {title: string, body: string, author: string, firstline: string, firstimage: any}) {
    return knex('omh.stories')
      .where({story_id})
      .update({
        title: data.title,
        body: data.body,
        author: data.author,
        firstline: data.firstline,
        firstimage: data.firstimage,
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
    await trx('omh.user_stories').where({story_id}).del() // leave until we delete the user_stories table
    return trx('omh.stories').where({story_id}).del()
  },

  async createStory (owned_by_group_id: string, user_id: number) {
    let story_id = await knex('omh.stories').insert({
      owned_by_group_id,
      published: false,
      created_at: knex.raw('now()'),
      updated_at: knex.raw('now()'),
      updated_by: user_id
    }).returning('story_id')

    story_id = parseInt(story_id)
    return story_id
  },

  async allowedToModify (story_id: number, user_id: number) {
    const story = await this.getStoryById(story_id)
    console.log(story)
    return Group.allowedToModify(story.owned_by_group_id, user_id)
  }
}
