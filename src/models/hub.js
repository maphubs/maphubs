// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var _map = require('lodash.map');
var debug = require ('../services/debug')('model/hub');
var Story = require('../models/story');
var Image = require('../models/image');
var Group = require('../models/group');

module.exports = {

  getAllHubs() {
      return knex.select(
        'omh.hubs.*',
         knex.raw('timezone(\'UTC\', omh.hubs.updated_at) as updated_at_withTZ')
    ).table('omh.hubs').where('published', true);
    },

  getRecentHubs(number: number = 15){
    return knex.select().table('omh.hubs')
    .where('published', true)
    .orderBy('updated_at', 'desc')
    .limit(number);
  },

  getPopularHubs(number: number = 15){
    return knex.select().table('omh.hubs')
    .where('published', true)
    .whereNotNull('views')
    .orderBy('views', 'desc')
    .limit(number);
  },

  getFeaturedHubs(number: number = 15){
    return knex.select().table('omh.hubs')
    .where({published: true, featured: true})
    .orderBy('name')
    .limit(number);
  },

    getHubStories(hub_id: string, includeDrafts: boolean = false) {
      debug('get stories for hub: ' + hub_id);
      var query = knex.select('omh.stories.story_id', 'omh.stories.title', 'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
       'omh.stories.firstline',  'omh.stories.firstimage', 'omh.stories.language', 'omh.stories.user_id',
       'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
       knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'))
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

    getSearchSuggestions(input: string) {
      input = input.toLowerCase();
      return knex.select('name')
      .table('omh.hubs')
      .where('published', true)
      .where(knex.raw(`to_tsvector('english', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('spanish', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('french', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('italian', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
      .orderBy('name');
    },

    getSearchResults(input: string) {
      input = input.toLowerCase();
      return knex.select().table('omh.hubs')
      .where('published', true)
      .where(knex.raw(`to_tsvector('english', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('spanish', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('french', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
        .orWhere(knex.raw(`to_tsvector('italian', hub_id
        || ' ' || name
        || ' ' || COALESCE(description, '')
        || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('` + input + `')
        `))
      .orderBy('name');
    },

    getHubByID(hub_id: string) {
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

    getHubsForUser(user_id: number) {
      debug('get hubs for user: ' + user_id);

/*
SELECT *
FROM omh.hubs
WHERE owned_by_group_id IN (SELECT group_id FROM omh.group_memberships WHERE user_id = 1);
*/
    return knex('omh.hubs')
      .whereIn('owned_by_group_id',
        knex.select('group_id').from('omh.group_memberships').where({user_id}))
      .orderBy('name');
    },

    getPublishedHubsForUser(user_id: number) {
      debug('get hubs for user: ' + user_id);
      return knex.select().from('omh.hubs')
      .whereIn('owned_by_group_id',
        knex.select('group_id').from('omh.group_memberships').where({user_id}))   
      .where({'omh.hubs.published': true})
      .orderBy('name');
    },

    getDraftHubsForUser(user_id: number) {
      debug('get hubs for user: ' + user_id);
      return knex.select().from('omh.hubs')
        .whereIn('owned_by_group_id',
          knex.select('group_id').from('omh.group_memberships').where({user_id}))     
        .where({'omh.hubs.published': false})
        .orderBy('name');
    },

    getGroupHubs(group_id: string, includePrivate: boolean = false) {
    var query = knex.select().from('omh.hubs').orderBy('name');
    if (includePrivate) {
      query.where('owned_by_group_id', group_id);
    } else {
      query.where({
        'published': true,
        'owned_by_group_id': group_id
      });
    }
    return query;
  },

    allowedToModify(hub_id: string, user_id: number){
      debug("checking if user: " + user_id + " is allowed to modify hub: " + hub_id);
      return this.getHubByID(hub_id).then(function(hub){
        return Group.allowedToModify(hub.owned_by_group_id, user_id);
      });
    },

    checkHubIdAvailable(hub_id: string) {
      return this.getHubByID(hub_id)
        .then(function(result) {
          if (result == null) return true;
          return false;
        });
    },

    createHub(hub_id: string, group_id: string, name: string, published: boolean, user_id: number) {
      hub_id = hub_id.toLowerCase();
      return knex.transaction(function(trx) {
      return trx('omh.hubs').insert({
          hub_id, name, published,
          owned_by_group_id: group_id,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
    });
    },

    updateHub(hub_id: string, name: string, description: string, tagline: string, published: boolean, resources: string, about: string, user_id: number) {
      //#TODO add option to change hub_id
      return knex('omh.hubs')
        .where('hub_id', hub_id)
        .update({
          name, description, tagline, published, resources, about,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
    },

    publishHub(hub_id: string, user_id: number) {
      return knex('omh.hubs')
        .where('hub_id', hub_id)
        .update({
          published: true,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        });
    },

    deleteHub(hub_id: string) {
      return knex.transaction(function(trx) {
        return Promise.all([
            trx('omh.hub_images').select('image_id').where({hub_id}),
            trx('omh.hub_stories').select('story_id').where({hub_id})
        ])

        .then(function(results){
          var imageIdResult = results[0];
          var storyIds = results[1];
          return Promise.each(storyIds, function(storyResult){
            var story_id = storyResult.story_id;
            debug('Deleting Hub Story: '+ story_id);
            return Image.removeAllStoryImages(story_id, trx)
              .then(function() {
                return Story.delete(story_id, trx);
                });
              }).then(function(){
            var commands = [];
            if(imageIdResult.length > 0){
              var imageIds = _map(imageIdResult, 'image_id');
              commands.push(trx('omh.hub_images').where('hub_id', hub_id).delete());
              commands.push(trx('omh.images').whereIn('image_id', imageIds).delete());
            }
            commands.push(trx('omh.hub_views').where('hub_id', hub_id).delete());
            commands.push(trx('omh.hub_layers').where('hub_id', hub_id).delete());
            commands.push(trx('omh.hubs').where('hub_id', hub_id).delete());

            return Promise.each(commands, function(command){
              return command;
            });
          });
        });
      });
    }
};
