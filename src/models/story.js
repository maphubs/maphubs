// @flow
const knex = require('../connection')
const Group = require('./group')
const Tags = require('./tags')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('model/story')

module.exports = {

  getStoriesBaseQuery (trx: any): any {
    const db = trx || knex
    return db.select(
      'omh.stories.story_id', 'omh.stories.title',
      'omh.stories.body', 'omh.stories.language',
      'omh.stories.summary', 'omh.stories.firstimage',
      'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
      'omh.stories.published_at',
      'omh.stories.updated_by',
      'omh.stories.owned_by_group_id',
      'omh.groups.name as groupname',
      knex.raw('to_jsonb(array_remove(array_agg(omh.story_tags.tag), NULL)) as tags')
    )
      .from('omh.stories')
      .leftJoin('omh.groups', 'omh.stories.owned_by_group_id', 'omh.groups.group_id')
      .leftJoin('omh.story_tags', 'omh.stories.story_id', 'omh.story_tags.story_id')
      .groupBy('omh.stories.story_id', 'omh.groups.name')
  },

  getAllStories (trx: any): any {
    const query = this.getStoriesBaseQuery(trx)
    return query
      .where('omh.stories.published', true)
  },

  getGroupStories (group_id: string, canEdit: boolean, trx?: any): any {
    const query = this.getStoriesBaseQuery(trx)
    query.where('omh.stories.owned_by_group_id', group_id)
    if (!canEdit) {
      query.where('omh.stories.published', true)
    }
    return query
  },

  getRecentStories (options: {number: number, tags?: Array<string>}): any {
    const { number, tags } = options
    let query = this.getStoriesBaseQuery()
    if (tags) {
      query = query
        .whereIn('omh.story_tags.tag', tags)
        .andWhere('omh.stories.published', true)
    } else {
      query = query.where('omh.stories.published', true)
    }
    return query
      .orderBy('omh.stories.published_at', 'desc')
      .limit(number || 10)
  },

  getPopularStories (number: number = 10): any {
    const query = this.getStoriesBaseQuery()
    return query
      .where('omh.stories.published', true)
      .orderBy('omh.stories.views', 'desc')
      .limit(number)
  },

  getFeaturedStories (number: number = 10): any {
    const query = this.getStoriesBaseQuery()
    return query
      .where('omh.stories.published', true)
      .andWhere('omh.stories.featured', true)
      .orderBy('omh.stories.published_at', 'desc')
      .limit(number)
  },

  getSearchSuggestions (input: string): any {
    input = input.toLowerCase()
    return knex.select('title').table('omh.stories')
      .where(knex.raw('lower(title)'), 'like', '%' + input + '%')
  },

  async getStoryById (story_id: number): Promise<any> {
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

  updateStory (
    story_id: number,
    data: {
      title: Object,
      body: Object,
      author: Object,
      summary: Object,
      firstimage: any,
      published: boolean,
      published_at: string,
      updated_by: number,
      owned_by_group_id: string,
      tags?: Array<string>
      }): any {
    return knex.transaction(async (trx) => {
      if (data.tags) {
        await Tags.updateStoryTags(data.tags, story_id, trx)
      }
      return trx('omh.stories')
        .where({story_id})
        .update({
          title: data.title,
          body: data.body,
          author: data.author,
          summary: data.summary,
          firstimage: data.firstimage,
          published: data.published,
          published_at: data.published_at,
          owned_by_group_id: data.owned_by_group_id,
          updated_at: knex.raw('now()'),
          updated_by: data.updated_by
        })
    })
  },

  async delete (story_id: number, trx: any): Promise<any> {
    await trx('omh.story_tags').where({story_id}).del()
    await trx('omh.story_views').where({story_id}).del()
    await trx('omh.story_maps').where({story_id}).del()
    await trx('omh.user_stories').where({story_id}).del() // leave until we delete the user_stories table
    return trx('omh.stories').where({story_id}).del()
  },

  async createStory (user_id: number): Promise<number> {
    if (!user_id) throw new Error('User ID required')
    let story_id = await knex('omh.stories').insert({
      published: false,
      created_at: knex.raw('now()'),
      updated_at: knex.raw('now()'),
      updated_by: user_id
    }).returning('story_id')

    story_id = Number.parseInt(story_id, 10)
    return story_id
  },

  async allowedToModify (story_id: number, user_id: number): Promise<any> {
    const story = await this.getStoryById(story_id)
    return Group.allowedToModify(story.owned_by_group_id, user_id)
  }
}
