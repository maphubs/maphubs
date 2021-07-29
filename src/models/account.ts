import { Knex } from 'knex'
import knex from '../connection'

export default {
  /**
   * Get tiers current offer to end-users
   * otherwise tiers are hidden to support grandfathered and custom accounts
   */
  async getAvailableTiers(trx?: Knex.Transaction): Promise<any> {
    const db = trx || knex
    return db('omh.account_tiers').where({
      available: true
    })
  },

  async getGroupTier(
    groupId: string,
    trx?: Knex.Transaction
  ): Promise<Record<string, any>> {
    const db = trx || knex
    const results = await db
      .select('omh.account_tiers.*')
      .from('omh.groups')
      .leftJoin(
        'omh.account_tiers',
        'omh.groups.tier_id',
        'omh.account_tiers.tier_id'
      )
      .where('omh.groups.group_id', groupId)

    if (results && results.length === 1) {
      return results[0]
    }

    return {}
  },

  async countGroupMembers(
    groupId: string,
    trx?: Knex.Transaction
  ): Promise<number> {
    const db = trx || knex
    const result = await db
      .count('user_id')
      .from('omh.group_memberships')
      .where({
        group_id: groupId
      })
    return Number.parseInt(result[0].count)
  },

  async countGroupPrivateLayers(
    groupId: string,
    trx?: Knex.Transaction
  ): Promise<number> {
    const db = trx || knex
    const result = await db.count('layer_id').from('omh.layers').where({
      owned_by_group_id: groupId,
      private: true
    })
    return Number.parseInt(result[0].count)
  },

  async countGroupPrivateHubs(
    groupId: string,
    trx?: Knex.Transaction
  ): Promise<number> {
    const db = trx || knex
    const result = await db.count('hub_id').from('omh.hubs').where({
      owned_by_group_id: groupId,
      private: true
    })
    return Number.parseInt(result[0].count)
  },

  async countGroupPrivateMaps(
    groupId: string,
    trx?: Knex.Transaction
  ): Promise<number> {
    const db = trx || knex
    const result = await db.count('map_id').from('omh.maps').where({
      owned_by_group_id: groupId,
      private: true
    })
    return Number.parseInt(result[0].count)
  },

  async getStatus(
    groupId: string,
    trx?: Knex.Transaction
  ): Promise<Record<string, any>> {
    const tier = await this.getGroupTier(groupId, trx)
    const numGroupMembers = await this.countGroupMembers(groupId, trx)
    const numPrivateLayers = await this.countGroupPrivateLayers(groupId, trx)
    const numPrivateHubs = await this.countGroupPrivateHubs(groupId, trx)
    const numPrivateMaps = await this.countGroupPrivateMaps(groupId, trx)
    return {
      tier,
      numGroupMembers,
      numPrivateLayers,
      numPrivateHubs,
      numPrivateMaps
    }
  }
}
