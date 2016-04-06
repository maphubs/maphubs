var knex = require('../connection.js');
var Promise = require('bluebird');
var _map = require('lodash.map');
var _find = require('lodash.find');
var debug = require ('../services/debug')('model/hub');

module.exports = {

  getAllHubs() {
      return knex.select().table('omh.hubs').where('published', true);
    },

  getRecentHubs(number = 15){
    return knex.select().table('omh.hubs')
    .where('published', true)
    .orderBy('updated_at', 'desc')
    .limit(number);
  },

  getPopularHubs(number = 15){
    return knex.select().table('omh.hubs')
    .where('published', true)
    .whereNotNull('views')
    .orderBy('views', 'desc')
    .limit(number);
  },

  getFeaturedHubs(number = 15){
    return knex.select().table('omh.hubs')
    .where({published: true, featured: true})
    .orderBy('name')
    .limit(number);
  },

    getHubStories(hub_id, includeDrafts = false) {
      debug('get stories for hub: ' + hub_id);
      var query = knex.select('omh.stories.story_id', 'omh.stories.title', 'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
       'omh.stories.firstline',  'omh.stories.firstimage', 'omh.stories.language', 'omh.stories.user_id',
       'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at', 'omh.stories.updated_at')
        .from('omh.stories')
        .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
        .leftJoin('omh.hubs', 'omh.hub_stories.hub_id', 'omh.hubs.hub_id');
      if (!includeDrafts) {
        query.where({
          'omh.hub_stories.hub_id': hub_id,
          'omh.stories.published': true
        });
      }else{
        query.where({
          'omh.hub_stories.hub_id': hub_id
        });
      }
      return query;
    },

    getSearchSuggestions(input) {
      input = input.toLowerCase();
      return knex.select('name').table('omh.hubs').whereRaw("lower(name) like '%" + input + "%'");
    },

    getHubByID(hub_id) {
      debug('get hub: ' + hub_id);
      return knex('omh.hubs')
        .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())
        .then(function(hubResult) {
          if (hubResult && hubResult.length == 1) {
            return knex('omh.hub_images').select().distinct('type')
            .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())
            .then(function(imagesResult){
              var hub = hubResult[0];
              var hasLogoImage = false;
              var hasBannerImage = false;
              if(imagesResult && imagesResult.length > 0){
                imagesResult.forEach(function(result){
                  if(result.type == 'logo'){
                    hasLogoImage = true;
                  }else if(result.type == 'banner'){
                    hasBannerImage = true;
                  }
                });
              }

              hub.hasLogoImage = hasLogoImage;
              hub.hasBannerImage = hasBannerImage;
              return hub;
            });
          }
          //else
          return null;
        });
    },

    getHubsForUser(user_id) {
      debug('get hubs for user: ' + user_id);
      return knex.select('omh.hubs.*').from('omh.hub_memberships')
        .leftJoin('omh.hubs', 'omh.hub_memberships.hub_id', 'omh.hubs.hub_id')
        .where('omh.hub_memberships.user_id', user_id);
    },

    getHubRole(user_id, hub_id) {
      return knex.select('omh.hub_memberships.role').from('omh.hub_memberships')
      .whereRaw('lower(hub_id) = ? AND user_id= ?', [hub_id.toLowerCase(), user_id]);
    },

    getHubMembers(hub_id) {
      return knex.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.hub_memberships.role').from('omh.hub_memberships')
        .leftJoin('public.users', 'omh.hub_memberships.user_id', 'public.users.id')
        .whereRaw('lower(omh.hub_memberships.hub_id) = ?', hub_id.toLowerCase());
    },

    getHubMembersByRole(hub_id, role) {
      return knex.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.hub_memberships.role').from('omh.hub_memberships')
        .leftJoin('public.users', 'omh.hub_memberships.user_id', 'public.users.id')
        .where({'omh.hub_memberships.hub_id': hub_id, 'omh.hub_memberships.role': role});
    },

    addHubMember(hub_id, user_id, role) {
      hub_id = hub_id.toLowerCase();
      return knex('omh.hub_memberships')
      .whereRaw('lower(hub_id) = ? AND user_id= ?', [hub_id.toLowerCase(), user_id])
      .then(function(result){
        if(result.length > 0){
          throw new Error("User is already a member of the hub");
        }else {
          return knex('omh.hub_memberships').insert({
            hub_id, user_id, role
          });
        }
      });

    },

    updateHubMemberRole(hub_id, user_id, role) {
      return knex('omh.hub_memberships')
        .whereRaw('lower(hub_id) = ? AND user_id= ?', [hub_id.toLowerCase(), user_id])
        .update({
          role
        });
    },

    removeHubMember(hub_id, user_id) {
      return knex('omh.hub_memberships')
        .whereRaw('lower(hub_id) = ? AND user_id= ?', [hub_id.toLowerCase(), user_id])
        .del();
    },

    /*
    addHubLayer(hub_id, layer_id, active) {
      hub_id = hub_id.toLowerCase();
      return knex('omh.hub_layers').insert({
        hub_id, layer_id, active
      })
    },

    removeHubLayer(hub_id, layer_id) {
      return knex('omh.hub_layers')
        .whereRaw('lower(hub_id) = ? AND layer_id= ?', [hub_id.toLowerCase(), layer_id])
        .del()
    },
    */

    allowedToModify(hub_id, user_id){
      debug("checking if user: " + user_id + " is allowed to modify hub: " + hub_id);
      return this.getHubMembers(hub_id)
        .then(function(users){
          if(_find(users, {id: user_id}) !== undefined){
            debug('user found');
            return true;
          }
          debug('user not allowed: ' + user_id);
          return false;
        });
      },

    checkHubIdAvailable(hub_id) {
      return this.getHubByID(hub_id)
        .then(function(result) {
          if (result == null) return true;
          return false;
        });
    },

    createHub(hub_id, name, published, user_id) {
      var role = 'Administrator';
      hub_id = hub_id.toLowerCase();
      return knex.transaction(function(trx) {
      return Promise.all([
        trx('omh.hubs').insert({
          hub_id, name, published,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
        }),
        //insert creating user as first admin
        trx('omh.hub_memberships').insert({
          hub_id, user_id, role
        })
      ]);
    });
    },

    updateHub(hub_id, name, description, tagline, published, resources, about, user_id) {
      //#TODO add option to change hub_id
      return knex('omh.hubs')
        .where('hub_id', hub_id)
        .update({
          name, description, tagline, published, resources, about,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
    },

    publishHub(hub_id, user_id) {
      return knex('omh.hubs')
        .where('hub_id', hub_id)
        .update({
          published: true,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
    },

    deleteHub(hub_id) {
      return knex.transaction(function(trx) {
        trx('omh.hub_images').select('image_id').where({hub_id})
        .then(function(imageIdResult){
          var commands = [];
          if(imageIdResult.length > 0){
            var imageIds = _map(imageIdResult, 'image_id');
            commands.push(trx('omh.hub_images').where('hub_id', hub_id).delete());
            commands.push(trx('omh.images').whereIn('image_id', imageIds).delete());
          }
          commands.push(trx('omh.hub_views').where('hub_id', hub_id).delete());
          commands.push(trx('omh.hub_memberships').where('hub_id', hub_id).delete());
          commands.push(trx('omh.hubs').where('hub_id', hub_id).delete());

          return Promise.each(commands, function(command){
            return command;
          });
        });
      });
    }
};
