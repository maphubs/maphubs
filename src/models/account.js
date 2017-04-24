//@flow
var knex = require('../connection.js');
var Promise = require('bluebird');

module.exports = {

  setGroupTier(group_id: string, tier_id: string, trx: any= null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.groups').udpdate({tier_id}).where({group_id});
  },

  /**
   * Get tiers current offer to end-users
   * otherwise tiers are hidden to support grandfathered and custom accounts
   */
  getAvailableTiers(trx: any= null): Bluebird$Promise<Array<Object>>{
    let db = knex;
    if(trx){db = trx;}
    return db('omh.account_tiers').where({available: true});
  },

  getGroupTier(group_id: string, trx: any= null): Bluebird$Promise<Object>{
      let db = knex;
    if(trx){db = trx;}
    return db.select('omh.account_tiers.*')
    .from('omh.groups').leftJoin('omh.account_tiers', 'omh.groups.tier_id', 'omh.account_tiers.tier_id')
    .where('omh.groups.group_id', group_id)
    .then((results) => {
      if(results && results.length === 1){
        return results[0];
      }
      return {};
    });
  },

  countGroupMembers(group_id: string, trx: any= null): Bluebird$Promise<number>{
    let db = knex;
    if(trx){db = trx;}
    return db.count('user_id').from('omh.group_memberships').where({group_id})
    .then((result) => {
      return parseInt(result[0].count);
    });
  },

  countGroupPrivateLayers(group_id: string, trx: any= null): Bluebird$Promise<number>{
    let db = knex;
    if(trx){db = trx;}
    return db.count('layer_id').from('omh.layers')
    .where({owned_by_group_id: group_id, private: true})
    .then((result) => {
      return parseInt(result[0].count);
    });
  },

  countGroupPrivateHubs(group_id: string, trx: any= null): Bluebird$Promise<number>{
    let db = knex;
    if(trx){db = trx;}
    return db.count('hub_id').from('omh.hubs')
    .where({owned_by_group_id: group_id, private: true})
    .then((result) => {
      return parseInt(result[0].count);
    });
  },

  countGroupPrivateMaps(group_id: string, trx: any= null): Bluebird$Promise<number>{
    let db = knex;
    if(trx){db = trx;}
    return db.count('map_id').from('omh.maps')
    .where({owned_by_group_id: group_id, private: true})
    .then((result) => {
      return parseInt(result[0].count);
    });
  },

  getStatus(group_id: string, trx: any= null): Bluebird$Promise<Object>{

    return Promise.all([
    this.getGroupTier(group_id, trx),
    this.countGroupMembers(group_id, trx),
    this.countGroupPrivateLayers(group_id, trx),
    this.countGroupPrivateHubs(group_id, trx),
    this.countGroupPrivateMaps(group_id, trx)
  ]).then((results) => {
    return {
      tier: results[0],
      numGroupMembers: results[1],
      numPrivateLayers: results[2],
      numPrivateHubs: results[3],
      numPrivateMaps: results[4],
    };
  });

  }

};