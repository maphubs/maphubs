// @flow
const knex = require('../connection')
const Promise = require('bluebird')
const _find = require('lodash.find')
const Account = require('./account')

module.exports = {

  getAllGroups (trx: any) {
    let db = knex
    if (trx) { db = trx }
    return db.select('omh.groups.*',
      db.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
    )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
  },

  getPopularGroups (number: number = 15) {
    return knex.select('omh.groups.*',
      knex.raw('(select sum(views) from omh.layers where owned_by_group_id=omh.groups.group_id) as layer_views'),
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
    )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true})
      .whereRaw('(select sum(views) from omh.layers where owned_by_group_id=omh.groups.group_id) > 0')
      .orderBy('layer_views', 'desc')
      .limit(number)
  },

  getRecentGroups (number: number = 15) {
    return knex.select('omh.groups.*',
      knex.raw('(select max(last_updated) from omh.layers where owned_by_group_id=omh.groups.group_id) as layers_updated'),
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
    )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true})
      .orderBy('layers_updated', 'desc')
      .limit(number)
  },

  getFeaturedGroups (number: number = 15) {
    return knex.select('omh.groups.*',
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
    ).table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true, featured: true})
      .orderBy('name')
      .limit(number)
  },

  getSearchSuggestions (input: string) {
    input = input.toLowerCase()
    return knex.select('name', 'group_id').table('omh.groups')
      .where(knex.raw(`
        to_tsvector('english', group_id
        || ' ' || COALESCE((name -> 'en')::text, '') || ' ' || COALESCE(location, '')
        || ' ' || COALESCE((description -> 'en')::text, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('spanish', group_id
        || ' ' || COALESCE((name -> 'es')::text, '') || ' ' || COALESCE(location, '')
        || ' ' || COALESCE((description -> 'es')::text, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('french', group_id
        || ' ' || COALESCE((name -> 'fr')::text, '') || ' ' || COALESCE(location, '')
        || ' ' || COALESCE((description -> 'fr')::text, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('italian', group_id
        || ' ' || COALESCE((name -> 'it')::text, '') || ' ' || COALESCE(location, '')
        || ' ' || COALESCE((description -> 'it')::text, '')) @@ plainto_tsquery(:input)
        `, {input}))
  },

  async getGroupByID (groupId: string) {
    const result = await knex.select().table('omh.groups')
      .whereRaw('lower(group_id) = ?', groupId.toLowerCase())
    if (result && result.length === 1) {
      return result[0]
    }
    // else
    return null
  },

  getSearchResults (input: string) {
    input = input.toLowerCase()
    return knex.select('omh.groups.*',
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
    )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where(knex.raw(`
        to_tsvector('english', omh.groups.group_id
        || ' ' || COALESCE((omh.groups.name -> 'en')::text, '') || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE((omh.groups.description -> 'en')::text, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('spanish', omh.groups.group_id
        || ' ' || COALESCE((omh.groups.name -> 'es')::text, '') || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE((omh.groups.description -> 'es')::text, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('french', omh.groups.group_id
        || ' ' || COALESCE((omh.groups.name -> 'fr')::text, '') || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE((omh.groups.description -> 'fr')::text, '')) @@ plainto_tsquery(:input)
        OR
        to_tsvector('italian', omh.groups.group_id
        || ' ' || COALESCE((omh.groups.name -> 'it')::text, '') || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE((omh.groups.description -> 'it')::text, '')) @@ plainto_tsquery(:input)
        `, {input}))
  },

  async getGroupsForUser (userId: number, trx: any = null) {
    const db = trx || knex

    const groups = await db.select('omh.groups.*',
      db.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'))
      .from('omh.group_memberships')
      .leftJoin('omh.groups', 'omh.group_memberships.group_id', 'omh.groups.group_id')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where('omh.group_memberships.user_id', userId)

    return Promise.map(groups, async (group) => {
      const status = await Account.getStatus(group.group_id)
      group.account = status
      return group
    })
  },

  async getGroupRole (userId: number, groupId: string): Object {
    const results = await knex
      .select('omh.group_memberships.role')
      .from('omh.group_memberships')
      .where({
        group_id: groupId,
        user_id: userId
      })
    if (results && results.length === 1) {
      return results[0].role
    }
    return null
  },

  getGroupMembers (groupId: string, trx: any = null): Promise<Array<Object>> {
    let db = knex
    if (trx) { db = trx }
    return db.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.group_memberships.role').from('omh.group_memberships')
      .leftJoin('public.users', 'omh.group_memberships.user_id', 'public.users.id')
      .where('omh.group_memberships.group_id', groupId)
  },

  getGroupMembersByRole (groupId: string, role: string) {
    return knex.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.group_memberships.role').from('omh.group_memberships')
      .leftJoin('public.users', 'omh.group_memberships.user_id', 'public.users.id')
      .where({'omh.group_memberships.group_id': groupId, 'omh.group_memberships.role': role})
  },

  addGroupMember (groupId: string, userId: number, role: string) {
    return knex('omh.group_memberships').insert({
      group_id: groupId, user_id: userId, role
    })
  },

  updateGroupMemberRole (groupId: string, userId: number, role: string) {
    return knex('omh.group_memberships')
      .where({group_id: groupId, user_id: userId})
      .update({role})
  },

  removeGroupMember (groupId: string, userId: number) {
    return knex('omh.group_memberships')
      .where({group_id: groupId, user_id: userId})
      .del()
  },

  async isGroupAdmin (groupId: string, userId: number) {
    if (!groupId || userId <= 0) {
      return false
    } else {
      const users = await this.getGroupMembers(groupId)
      const user = _find(users, {id: userId})
      if (user && user.role === 'Administrator') {
        return true
      }
      return false
    }
  },

  async allowedToModify (groupId: string, userId: number) {
    if (!groupId || userId <= 0) {
      return false
    } else {
      const users = await this.getGroupMembers(groupId)
      if (_find(users, {id: userId}) !== undefined) {
        return true
      }
      return false
    }
  },

  async checkGroupIdAvailable (groupId: string) {
    const result = await this.getGroupByID(groupId)
    if (result === null) return true
    return false
  },

  async createGroup (groupId: string, name: string, description: string, location: string, published: boolean, userId: number) {
    return knex.transaction(async (trx) => {
      await trx('omh.groups').insert({
        group_id: groupId, name, description, location, published, tier_id: 'public'
      })
      // insert creating user as first admin
      return trx('omh.group_memberships').insert({
        group_id: groupId, user_id: userId, role: 'Administrator'
      })
    })
  },

  updateGroup (groupId: string, name: string, description: string, location: string, published: boolean) {
    return knex('omh.groups')
      .where('group_id', groupId)
      .update({
        name, description, location, published
      })
  },

  async deleteGroup (groupId: string) {
    return knex.transaction(async (trx) => {
      await trx('omh.group_images').where({group_id: groupId}).del()
      await trx('omh.group_memberships').where({group_id: groupId}).del()
      await trx('omh.groups').where({group_id: groupId}).del()
      return true
    })
  }

}
