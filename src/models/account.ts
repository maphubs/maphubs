import { Knex } from 'knex'
import knex from '../connection'

export default {
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
    return {
      tier
    }
  }
}
