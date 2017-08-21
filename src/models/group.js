// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var _find = require('lodash.find');
var Account = require('./account');

module.exports = {

  getAllGroups(trx: any) {
    let db = knex;
    if(trx){db = trx;}
    return db.select('omh.groups.*',
    db.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
    )
    .table('omh.groups')
    .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id');
  },

    getPopularGroups(number: number = 15){
      return knex.select('omh.groups.*',
      knex.raw('(select sum(views) from omh.layers where owned_by_group_id=omh.groups.group_id) as layer_views'),
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
      )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true})
      .whereRaw('(select sum(views) from omh.layers where owned_by_group_id=omh.groups.group_id) > 0')
      .orderBy('layer_views', 'desc')
      .limit(number);
    },

    getRecentGroups(number: number = 15){
      return knex.select('omh.groups.*',
      knex.raw('(select max(last_updated) from omh.layers where owned_by_group_id=omh.groups.group_id) as layers_updated'),
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
      )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true})
      .orderBy('layers_updated', 'desc')
      .limit(number);
    },

    getFeaturedGroups(number: number = 15){
      return knex.select('omh.groups.*',
        knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
      ).table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true, featured: true})
      .orderBy('name')
      .limit(number);
    },

    getSearchSuggestions(input: string) {
      input = input.toLowerCase();
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
        `, {input}));
    },

    async getGroupByID(group_id: string) {
      const result = await knex.select().table('omh.groups')
        .whereRaw('lower(group_id) = ?', group_id.toLowerCase());
      if (result && result.length === 1) {
        return result[0];
      }
      //else
      return null;
    },

    getSearchResults(input: string) {
      input = input.toLowerCase();
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
        `, {input}));
    },

    async getGroupsForUser(user_id: number, trx: any = null) {
      let db = trx ? trx : knex;

      const groups = await db.select('omh.groups.*',
      db.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'))
      .from('omh.group_memberships')
        .leftJoin('omh.groups', 'omh.group_memberships.group_id', 'omh.groups.group_id')
        .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
        .where('omh.group_memberships.user_id', user_id);
      
      return Promise.map(groups, async (group) =>{
        const status = await Account.getStatus(group.group_id);
        group.account = status;
        return group;
      });
    },

    async getGroupRole(user_id: number, group_id: string): Object {
      const results = await knex
      .select('omh.group_memberships.role')
      .from('omh.group_memberships')
      .where({
        group_id,
        user_id
      });
      if(results && results.length === 1){
        return results[0].role;
      }
      return null;
    },

    getGroupMembers(group_id: string, trx: any= null): Promise<Array<Object>> {
      let db = knex;
      if(trx){db = trx;}
      return db.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.group_memberships.role').from('omh.group_memberships')
        .leftJoin('public.users', 'omh.group_memberships.user_id', 'public.users.id')
        .where('omh.group_memberships.group_id', group_id);
    },

    getGroupMembersByRole(group_id: string, role: string) {
      return knex.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.group_memberships.role').from('omh.group_memberships')
        .leftJoin('public.users', 'omh.group_memberships.user_id', 'public.users.id')
        .where({'omh.group_memberships.group_id': group_id, 'omh.group_memberships.role': role});
    },


    addGroupMember(group_id: string, user_id: number, role: string) {
      return knex('omh.group_memberships').insert({
        group_id, user_id, role
      });
    },

    updateGroupMemberRole(group_id: string, user_id: number, role: string) {
      return knex('omh.group_memberships')
        .where({group_id, user_id})
        .update({role});
    },

    removeGroupMember(group_id: string, user_id: number) {
      return knex('omh.group_memberships')
        .where({group_id, user_id})
        .del();
    },

    async allowedToModify(group_id: string, user_id: number){
      if(!group_id || user_id <= 0){
        return false;
      }else{
        const users = await this.getGroupMembers(group_id);
        if(_find(users, {id: user_id}) !== undefined){
          return true;
        }
        return false;
      }
    },

    async checkGroupIdAvailable(group_id: string) {
      const result = await this.getGroupByID(group_id);
      if (result === null) return true;
      return false;
    },

    async createGroup(group_id: string, name: string, description: string, location: string, published: boolean, user_id: number) {
      return knex.transaction(async (trx) => {
        await trx('omh.groups').insert({
          group_id, name, description, location, published, tier_id: 'public'
        });
        //insert creating user as first admin
        await trx('omh.group_memberships').insert({
          group_id, user_id, role: 'Administrator'
        });
      });
    },

    updateGroup(group_id: string, name: string, description: string, location: string, published: boolean) {
      //#TODO:0 add option to change group_id
      return knex('omh.groups')
        .where('group_id', group_id)
        .update({
          name, description, location, published
        });
    },

    async deleteGroup(group_id: string) {
      return knex.transaction(async(trx) => {
        await trx('omh.group_images').where({group_id}).del();
        await trx('omh.group_memberships').where({group_id}).del();
        await trx('omh.groups').where('group_id', group_id).del();
        return true;
      });
    }

};
