//@flow
var knex = require('../connection.js');

module.exports = {

  async setGroupTier(group_id: string, tier_id: string, trx: any= null){
    let db = trx ? trx : knex;
    return db('omh.groups').udpdate({tier_id}).where({group_id});
  },

  /**
   * Get tiers current offer to end-users
   * otherwise tiers are hidden to support grandfathered and custom accounts
   */
  async getAvailableTiers(trx: any= null){
    let db = trx ? trx : knex;
    return db('omh.account_tiers').where({available: true});
  },

  async getGroupTier(group_id: string, trx: any= null): Promise<Object>{
    let db = trx ? trx : knex;
    const results = await db.select('omh.account_tiers.*')
    .from('omh.groups').leftJoin('omh.account_tiers', 'omh.groups.tier_id', 'omh.account_tiers.tier_id')
    .where('omh.groups.group_id', group_id);

    if(results && results.length === 1){
      return results[0];
    }
    return {};
  },

  async countGroupMembers(group_id: string, trx: any= null): Promise<number>{
    let db = trx ? trx : knex;
    const result = await db.count('user_id').from('omh.group_memberships').where({group_id});
    return parseInt(result[0].count);
  },

  async countGroupPrivateLayers(group_id: string, trx: any= null): Promise<number>{
    let db = trx ? trx : knex;
    const result = await db.count('layer_id').from('omh.layers')
    .where({owned_by_group_id: group_id, private: true});
    return parseInt(result[0].count);
  },

  async countGroupPrivateHubs(group_id: string, trx: any= null): Promise<number>{
    let db = trx ? trx : knex;
    const result = await db.count('hub_id').from('omh.hubs')
    .where({owned_by_group_id: group_id, private: true});
    return parseInt(result[0].count);
  },

  async countGroupPrivateMaps(group_id: string, trx: any= null): Promise<number>{
    let db = trx ? trx : knex;
    const result = await db.count('map_id').from('omh.maps')
    .where({owned_by_group_id: group_id, private: true});
    return parseInt(result[0].count);
  },

  async getStatus(group_id: string, trx: any= null): Promise<Object>{

    const tier = await this.getGroupTier(group_id, trx);
    const numGroupMembers = await this.countGroupMembers(group_id, trx);
    const numPrivateLayers = await this.countGroupPrivateLayers(group_id, trx);
    const numPrivateHubs = await this.countGroupPrivateHubs(group_id, trx);
    const numPrivateMaps = await this.countGroupPrivateMaps(group_id, trx);

    return {
      tier,
      numGroupMembers,
      numPrivateLayers,
      numPrivateHubs,
      numPrivateMaps,
    };
  }
};