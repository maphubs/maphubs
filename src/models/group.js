var knex = require('../connection.js');
var Promise = require('bluebird');
var _find = require('lodash.find');

module.exports = {

  getAllGroups() {
      return knex.select().table('omh.groups').orderBy('name');
    },

    getPopularGroups(number = 15){
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

    getRecentGroups(number = 15){
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

    getFeaturedGroups(number = 15){
      return knex.select('omh.groups.*',
        knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
      ).table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where({published: true, featured: true})
      .orderBy('name')
      .limit(number);
    },

    getSearchSuggestions(input) {
      input = input.toLowerCase();
      return knex.select('name', 'group_id').table('omh.groups')
      .where(knex.raw(`to_tsvector('english', group_id
        || ' ' || name || ' ' || COALESCE(location, '')
        || ' ' || COALESCE(description, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('spanish', group_id
        || ' ' || name || ' ' || COALESCE(location, '')
        || ' ' || COALESCE(description, '')) @@ plainto_tsquery('` + input + `')
        `))
         .orWhere(knex.raw(`to_tsvector('french', group_id
        || ' ' || name || ' ' || COALESCE(location, '')
        || ' ' || COALESCE(description, '')) @@ plainto_tsquery('` + input + `')
        `))
         .orWhere(knex.raw(`to_tsvector('italian', group_id
        || ' ' || name || ' ' || COALESCE(location, '')
        || ' ' || COALESCE(description, '')) @@ plainto_tsquery('` + input + `')
        `));
    },

    getGroupByID(group_id) {
      return knex.select().table('omh.groups')
        .whereRaw('lower(group_id) = ?', group_id.toLowerCase())
        .then(function(result) {
          if (result && result.length == 1) {
            return result[0];
          }
          //else
          return null;
        });
    },

    getSearchResults(input) {
      input = input.toLowerCase();
      return knex.select('omh.groups.*',
        knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage')
      )
      .table('omh.groups')
      .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
      .where(knex.raw(`to_tsvector('english', omh.groups.group_id
        || ' ' || omh.groups.name || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE(omh.groups.description, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('spanish', omh.groups.group_id
        || ' ' || omh.groups.name || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE(omh.groups.description, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('french', omh.groups.group_id
        || ' ' || omh.groups.name || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE(omh.groups.description, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('italian', omh.groups.group_id
        || ' ' || omh.groups.name || ' ' || COALESCE(omh.groups.location, '')
        || ' ' || COALESCE(omh.groups.description, '')) @@ plainto_tsquery('` + input + `')
        `));
    },

    getGroupsForUser(user_id) {
      return knex.select('omh.groups.*',
      knex.raw('CASE WHEN omh.group_images.group_id IS NOT NULL THEN true ELSE false END as hasImage'))
      .from('omh.group_memberships')
        .leftJoin('omh.groups', 'omh.group_memberships.group_id', 'omh.groups.group_id')
        .leftJoin('omh.group_images', 'omh.groups.group_id', 'omh.group_images.group_id')
        .where('omh.group_memberships.user_id', user_id);
    },

    getGroupRole(user_id, group_id) {
      return knex.select('omh.group_memberships.role').from('omh.group_memberships')
        .where({
          group_id,
          user_id
        });
    },

    getGroupMembers(group_id, trx = null) {
      let db = knex;
      if(trx){db = trx;}
      return db.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.group_memberships.role').from('omh.group_memberships')
        .leftJoin('public.users', 'omh.group_memberships.user_id', 'public.users.id')
        .where('omh.group_memberships.group_id', group_id);
    },

    getGroupMembersByRole(group_id, role) {
      return knex.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.group_memberships.role').from('omh.group_memberships')
        .leftJoin('public.users', 'omh.group_memberships.user_id', 'public.users.id')
        .where({'omh.group_memberships.group_id': group_id, 'omh.group_memberships.role': role});
    },


    addGroupMember(group_id, user_id, role) {
      return knex('omh.group_memberships').insert({
        group_id, user_id, role
      });
    },

    updateGroupMemberRole(group_id, user_id, role) {
      return knex('omh.group_memberships')
        .where({group_id, user_id})
        .update({role});
    },

    removeGroupMember(group_id, user_id) {
      return knex('omh.group_memberships')
        .where({group_id, user_id})
        .del();
    },

    allowedToModify(group_id, user_id){
      if(!group_id || !user_id){
        return false;
      }
      return this.getGroupMembers(group_id)
        .then(function(users){
          if(_find(users, {id: user_id}) !== undefined){
            return true;
          }
          return false;
        });
      },

    checkGroupIdAvailable(group_id) {
      return this.getGroupByID(group_id)
        .then(function(result) {
          if (result == null) return true;
          return false;
        });
    },

    createGroup(group_id, name, description, location, published, user_id) {
      var role = 'Administrator';
      return knex.transaction(function(trx) {
        return Promise.all([
          trx('omh.groups').insert({
            group_id, name, description, location, published
          }),
          //insert creating user as first admin
          trx('omh.group_memberships').insert({
            group_id, user_id, role
          })
        ]);
      });
    },

    updateGroup(group_id, name, description, location, published) {
      //#TODO:0 add option to change group_id
      return knex('omh.groups')
        .where('group_id', group_id)
        .update({
          name, description, location, published
        });
    },

    deleteGroup(group_id) {
      return knex.transaction(function(trx) {
        return trx('omh.group_images').where({group_id}).del()
        .then(function(){
          return trx('omh.group_memberships').where({group_id}).del()
          .then(function(){
          return trx('omh.groups').where('group_id', group_id).del()
            .then(function(){
              return true;
              });
            });
          });
        });
    }

};
