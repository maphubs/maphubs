import knex from '../connection'
import _find from 'lodash.find'
import { Knex } from 'knex'
import { Group } from '../types/group'
import { LocalizedString } from '../types/LocalizedString'
import { User } from '../types/user'
import { nanoid } from 'nanoid'

export default {
  getAllGroups(trx?: Knex.Transaction): Knex.QueryBuilder {
    const db = trx || knex

    return db
      .select(
        'omh.groups.*',
        db.raw(
          'CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'
        )
      )
      .table('omh.groups')
      .leftJoin(
        'omh.group_images',
        'omh.groups.group_id',
        'omh.group_images.group_id'
      )
  },

  getRecentGroups(number = 15): Knex.QueryBuilder {
    return knex
      .select(
        'omh.groups.*',
        knex.raw(
          '(select max(last_updated) from omh.layers where owned_by_group_id=omh.groups.group_id) as layers_updated'
        ),
        knex.raw(
          'CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'
        )
      )
      .table('omh.groups')
      .leftJoin(
        'omh.group_images',
        'omh.groups.group_id',
        'omh.group_images.group_id'
      )
      .where({
        published: true
      })
      .orderBy('layers_updated', 'desc')
      .limit(number)
  },

  getFeaturedGroups(number = 15): Knex.QueryBuilder {
    return knex
      .select(
        'omh.groups.*',
        knex.raw(
          'CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'
        )
      )
      .table('omh.groups')
      .leftJoin(
        'omh.group_images',
        'omh.groups.group_id',
        'omh.group_images.group_id'
      )
      .where({
        published: true,
        featured: true
      })
      .orderBy('name')
      .limit(number)
  },

  async getSearchSuggestions(
    input: string
  ): Promise<{ name: LocalizedString; group_id: string }[]> {
    input = input.toLowerCase()
    return knex
      .select('name', 'group_id')
      .table('omh.groups')
      .where(
        knex.raw(
          `
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
        `,
          {
            input
          }
        )
      )
  },

  async getGroupByID(groupId: string): Promise<Group> {
    const result = await knex
      .select()
      .table('omh.groups')
      .whereRaw('lower(group_id) = ?', groupId.toLowerCase())

    if (result && result.length === 1) {
      return result[0]
    }

    // else
    return null
  },

  getSearchResults(input: string): Knex.QueryBuilder {
    input = input.toLowerCase()
    return knex
      .select(
        'omh.groups.*',
        knex.raw(
          'CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'
        )
      )
      .table('omh.groups')
      .leftJoin(
        'omh.group_images',
        'omh.groups.group_id',
        'omh.group_images.group_id'
      )
      .where(
        knex.raw(
          `
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
        `,
          {
            input
          }
        )
      )
  },

  async getGroupsForUser(
    userId: number,
    trx?: Knex.Transaction
  ): Promise<Group[]> {
    const db = trx || knex
    const groups = await db
      .select(
        'omh.groups.*',
        db.raw(
          'CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'
        )
      )
      .from('omh.group_memberships')
      .leftJoin(
        'omh.groups',
        'omh.group_memberships.group_id',
        'omh.groups.group_id'
      )
      .leftJoin(
        'omh.group_images',
        'omh.groups.group_id',
        'omh.group_images.group_id'
      )
      .where('omh.group_memberships.user_id', userId)
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return groups
  },

  async getGroupRole(userId: number, groupId: string): Promise<string | null> {
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

  getGroupMembers(groupId: string, trx?: Knex.Transaction): Knex.QueryBuilder {
    const db = trx || knex

    return db
      .select(
        'public.nextauth_users.id',
        'public.nextauth_users.email',
        'omh.group_memberships.role'
      )
      .from('omh.group_memberships')
      .leftJoin(
        'public.nextauth_users',
        'omh.group_memberships.user_id',
        'public.nextauth_users.id'
      )
      .where('omh.group_memberships.group_id', groupId)
  },

  getGroupMembersByRole(groupId: string, role: string): Knex.QueryBuilder {
    return knex
      .select(
        'public.nextauth_users.id',
        'public.nextauth_users.email',
        'omh.group_memberships.role'
      )
      .from('omh.group_memberships')
      .leftJoin(
        'public.nextauth_users',
        'omh.group_memberships.user_id',
        'public.nextauth_users.id'
      )
      .where({
        'omh.group_memberships.group_id': groupId,
        'omh.group_memberships.role': role
      })
  },

  addGroupMember(
    groupId: string,
    userId: number,
    role: string
  ): Knex.QueryBuilder {
    return knex('omh.group_memberships').insert({
      group_id: groupId,
      user_id: userId,
      role
    })
  },

  updateGroupMemberRole(
    groupId: string,
    userId: number,
    role: string
  ): Knex.QueryBuilder {
    return knex('omh.group_memberships')
      .where({
        group_id: groupId,
        user_id: userId
      })
      .update({
        role
      })
  },

  removeGroupMember(groupId: string, userId: number): Knex.QueryBuilder {
    return knex('omh.group_memberships')
      .where({
        group_id: groupId,
        user_id: userId
      })
      .del()
  },

  async isGroupAdmin(groupId: string, userId: number): Promise<boolean> {
    if (!groupId || userId <= 0) {
      return false
    } else {
      const groupMembers: User[] = await this.getGroupMembers(groupId)
      console.log(`userID(${userId}) ${typeof userId}`)
      console.log(groupMembers)

      const foundUser = groupMembers.find((u) => u.id === userId)

      console.log(foundUser)
      if (foundUser) {
        if (foundUser.role === 'Administrator') {
          return true
        } else {
          console.warn('user not group admin')
          return false
        }
      } else {
        throw new Error(`User not found: ${userId}`)
      }
    }
  },

  async allowedToModify(groupId: string, userId: number): Promise<boolean> {
    if (!groupId || userId <= 0) {
      return false
    } else {
      const users = await this.getGroupMembers(groupId)

      if (
        _find(users, {
          id: userId
        }) !== undefined
      ) {
        return true
      }

      return false
    }
  },

  async checkGroupIdAvailable(groupId: string): Promise<boolean> {
    const result = await this.getGroupByID(groupId)
    if (result === null) return true
    return false
  },

  async createGroup(
    groupId: string,
    name: LocalizedString,
    description: LocalizedString,
    userId: number
  ): Promise<any> {
    return knex.transaction(async (trx) => {
      console.info(`Creating group ${groupId} for user ${userId}`)
      await trx('omh.groups').insert({
        group_id: groupId,
        name,
        description,
        published: true
      })
      // insert creating user as first admin
      return trx('omh.group_memberships').insert({
        group_id: groupId,
        user_id: userId,
        role: 'Administrator'
      })
    })
  },

  updateGroup(
    groupId: string,
    name: LocalizedString,
    description: LocalizedString
  ): Knex.QueryBuilder {
    return knex('omh.groups').where('group_id', groupId).update({
      name,
      description
    })
  },

  async deleteGroup(groupId: string): Promise<boolean> {
    return knex.transaction(async (trx: Knex.Transaction) => {
      await trx('omh.group_images')
        .where({
          group_id: groupId
        })
        .del()
      await trx('omh.group_memberships')
        .where({
          group_id: groupId
        })
        .del()
      await trx('omh.groups')
        .where({
          group_id: groupId
        })
        .del()
      return true
    })
  },

  async getJoinCode(groupId: string): Promise<string> {
    const result = await knex('omh.groups')
      .select('join_code')
      .where({ group_id: groupId })
    if (result && result.length === 1) {
      return result[0].join_code
    } else {
      throw new Error('group not found')
    }
  },

  async rotateJoinCode(groupId: string): Promise<string> {
    const code = nanoid()
    await knex('omh.groups')
      .update({ join_code: code })
      .where({ group_id: groupId })
    return code
  }
}
