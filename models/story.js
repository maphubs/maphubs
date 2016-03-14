var knex = require('../connection.js');
var Promise = require('bluebird');
var Hub = require('./hub');
var debug = require ('../services/debug')('model/story');

module.exports = {

  getRecentStories(number=10) {
      return knex.select(
      'omh.stories.story_id', 'omh.stories.title',
       'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
       'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
      knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
      'omh.user_stories.user_id', 'public.users.display_name',
      'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name')
      .table('omh.stories')
      .where('omh.stories.published', true)
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
      .orderBy('omh.stories.created_at', 'desc')
      .limit(number);
    },

    getSearchSuggestions(input) {
      input = input.toLowerCase();
      return knex.select('title').table('omh.stories').whereRaw("lower(title) like '%" + input + "%'");
    },

    getStoryByID(story_id) {
      return knex.select(
        'story_id', 'title', 'body',
         'firstline', 'firstimage', 'language',
         'published', 'author', 'created_at',
        knex.raw('timezone(\'UTC\', updated_at) as updated_at')
      ).table('omh.stories').where('story_id', story_id)
        .then(function(result) {
          if (result && result.length == 1) {
            return result[0];
          }
          //else
          return null;
        });
    },

    getHubStories(hub_id, includeDrafts = false) {
      debug('get stories for hub: ' + hub_id);
      var query = knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name'
      )
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

    getUserStories(user_id, includeDrafts = false) {
      debug('get stories for user: ' + user_id);
      var query = knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        'omh.user_stories.user_id', 'public.users.display_name'
      )
        .from('omh.stories')
        .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
        .leftJoin('public.users', 'omh.user_stories.user_id', 'public.users.id');
      if (!includeDrafts) {
        query.where({
          'public.users.id': user_id,
          'omh.stories.published': true
        });
      }else{
        query.where({
          'public.users.id': user_id
        });
      }
      return query;
    },

    updateStory(story_id, title, body, firstline, firstimage) {
      return knex('omh.stories')
        .where('story_id', story_id)
        .update({
          title, body, firstline, firstimage,
          updated_at: knex.raw('now()')
        });
    },

    delete(story_id){
      return knex.transaction(function(trx) {
        return trx('omh.story_views').where({story_id}).del()
        .then(function(){
          return trx('omh.story_maps').where({story_id}).del()
          .then(function(){
            return trx('omh.hub_stories').where({story_id}).del()
            .then(function(){
              return trx('omh.user_stories').where({story_id}).del()
              .then(function(){
                  return trx('omh.stories').where({story_id}).del();
              });
            });
          });
        });
      });
    },

    createHubStory(hub_id, title, body, firstline, firstimage, user_id) {
      return knex.transaction(function(trx) {
        return trx('omh.stories').insert({
          title, body, firstline, firstimage, user_id,
          published: true,
          created_at: knex.raw('now()'),
          updated_at: knex.raw('now()')
        }).returning('story_id')
        .then(function(story_id){
          story_id = parseInt(story_id);
          return trx('omh.hub_stories').insert({hub_id, story_id})
          .returning('story_id');
        });
      });
    },

    createUserStory(user_id, title, body, firstline, firstimage) {
      return knex.transaction(function(trx) {
        return trx('omh.stories').insert({
          title, body, firstline, firstimage, user_id,
          published: true,
          created_at: knex.raw('now()'),
          updated_at: knex.raw('now()')
        }).returning('story_id')
        .then(function(story_id){
          story_id = parseInt(story_id);
          return trx('omh.user_stories').insert({user_id, story_id})
          .returning('story_id');
        });
      });
    },

    allowedToModify(story_id, user_id) {
      //look in both hub stories and user Stories
      return Promise.all([
        knex('omh.hub_stories').where({story_id}),
        knex('omh.user_stories').where({story_id})
      ]).then(function(results){
        var hubStories = results[0];
        var userStories = results[1];
        if(hubStories && hubStories.length > 0){
          //check if user is allow to modify the hub
          var hub_id = hubStories[0].hub_id;
          debug('found a hub story in hub: '+ hub_id);
          return Hub.allowedToModify(hub_id, user_id);
        }else if(userStories && userStories.length > 0){
          debug('found a user story');
          // the story must belong to the requesting user
          if(parseInt(userStories[0].user_id) == parseInt(user_id)){
            return true;
          }else {
            debug('user: ' + user_id + ' is not the owner of story: ' + story_id);
            return false;
          }
        }else {
          //story not found
          throw new Error('Story not found: '+ story_id);
        }
      });
    }
};
