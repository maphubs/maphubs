// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var _find = require('lodash.find');
var debug = require ('../services/debug')('model/story');

module.exports = {

  getAllStories() {
      return knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        'omh.user_stories.user_id', 'public.users.display_name',
        'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
        knex.raw('md5(lower(trim(public.users.email))) as emailhash')
        )
      .table('omh.stories')
      .where('omh.stories.published', true)
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
      .orderBy('omh.stories.created_at', 'desc');
    },

  getRecentStories(number: number=10) {
      return knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        'omh.user_stories.user_id', 'public.users.display_name',
        'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
        knex.raw('md5(lower(trim(public.users.email))) as emailhash')
        )
      .table('omh.stories')
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')    
      .whereRaw('omh.stories.published=true AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true)')
      .orderBy('omh.stories.created_at', 'desc')
      .limit(number);
    },

    getPopularStories(number: number=10) {
        return knex.select(
          'omh.stories.story_id', 'omh.stories.title',
           'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
           'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
          knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
          'omh.user_stories.user_id', 'public.users.display_name',
          'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
          knex.raw('md5(lower(trim(public.users.email))) as emailhash')
          )
        .table('omh.stories')
        .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
        .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
        .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
        .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
        .whereRaw('omh.stories.published=true AND omh.stories.views IS NOT NULL AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true)')
        .orderBy('omh.stories.views', 'desc')
        .limit(number);
      },

    getFeaturedStories(number: number=10) {
        return knex.select(
          'omh.stories.story_id', 'omh.stories.title',
           'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
           'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
          knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
          'omh.user_stories.user_id', 'public.users.display_name',
          'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name',
          knex.raw('md5(lower(trim(public.users.email))) as emailhash')
          )
        .table('omh.stories')     
        .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
        .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
        .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
        .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id')
        .whereRaw('omh.stories.published=true AND omh.stories.featured=true AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true)')
        .orderBy('omh.stories.created_at', 'desc')
        .limit(number);
      },

    getSearchSuggestions(input: string) {
      input = input.toLowerCase();
      return knex.select('title').table('omh.stories')
      .where(knex.raw('lower(title)'), 'like', '%' + input + '%');
    },

    getStoryByID(story_id: number) {
      var _this = this;
      return _this.getUserStoryById(story_id)
      .then(function(userStoryResult){
        if(userStoryResult && userStoryResult.length > 0){
          return userStoryResult[0];
        }else{
          return _this.getHubStoryById(story_id)
          .then(function(hubStoryResult){
            if(hubStoryResult && hubStoryResult.length > 0){
              return hubStoryResult[0];
            }else{
              return null;
            }
          });
        }
      });

    },

    getHubStoryById(story_id: number) {
      debug('get hub story: ' + story_id);
      var query = knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.body', 'omh.stories.language',
         'omh.stories.firstline',  'omh.stories.firstimage',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        'omh.hub_stories.hub_id', 'omh.hubs.name as hub_name'
      )
        .from('omh.stories')
        .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
        .leftJoin('omh.hubs', 'omh.hub_stories.hub_id', 'omh.hubs.hub_id')
        .where({
          'omh.hub_stories.story_id': story_id
        });

      return query;
    },

    getUserStories(user_id: number, includeDrafts: boolean = false) {
      debug('get stories for user: ' + user_id);
      var query = knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.firstline', 'omh.stories.firstimage', 'omh.stories.language',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
        'omh.user_stories.user_id', 'public.users.display_name'
      )
        .from('omh.stories')
        .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
        .leftJoin('public.users', 'omh.user_stories.user_id', 'public.users.id');
      if (!includeDrafts) {
        query.where({
          'omh.user_stories.user_id': user_id,
          'omh.stories.published': true
        });
      }else{
        query.where({
          'public.users.id': user_id
        });
      }
      return query;
    },

    getUserStoryById(story_id: number) {
      debug('get user story: ' + story_id);
      var query = knex.select(
        'omh.stories.story_id', 'omh.stories.title',
         'omh.stories.body', 'omh.stories.language',
         'omh.stories.firstline',  'omh.stories.firstimage',
         'omh.stories.published', 'omh.stories.author', 'omh.stories.created_at',
        knex.raw('timezone(\'UTC\', omh.stories.updated_at) as updated_at'),
        knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
        'omh.user_stories.user_id', 'public.users.display_name'
      )
        .from('omh.stories')
        .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
        .leftJoin('public.users', 'omh.user_stories.user_id', 'public.users.id')
        .whereNotNull('omh.user_stories.story_id')
        .where({
          'omh.stories.story_id': story_id
        });

      return query;
    },

    updateStory(story_id: number, title: string, body: string, author: string, firstline: string, firstimage: any) {
      return knex('omh.stories')
        .where('story_id', story_id)
        .update({
          title, body, author, firstline, firstimage,
          updated_at: knex.raw('now()')
        });
    },

    publishStory(story_id: number) {
      return knex('omh.stories')
        .where('story_id', story_id)
        .update({
          published: true,
          updated_at: knex.raw('now()')
        });
    },

    delete(story_id: number, trx: any){
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
    },

    createHubStory(hub_id: number, title: string, body: string, author: string, firstline: string, firstimage: string, user_id: number) {
      return knex.transaction(function(trx) {
        return trx('omh.stories').insert({
          title, body, author, firstline, firstimage, user_id,
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

    createUserStory(user_id: number, title: string, body: string, firstline: string, firstimage: any) {
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

    allowedToModify(story_id: number, user_id: number) {
      var _this = this;
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
          return _this.allowedToModifyHub(hub_id, user_id);
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
    },

  allowedToModifyHub(hub_id: string, user_id: number){
    debug("checking if user: " + user_id + " is allowed to modify hub: " + hub_id);
    return this.getHubMembers(hub_id)
      .then(function(users: Array<Object>){
        if(_find(users, {id: user_id}) !== undefined){
          debug('user found');
          return true;
        }
        debug('user not allowed: ' + user_id);
        return false;
      });
    },

    getHubMembers(hub_id: string) {
      return knex.select('public.users.id', 'public.users.display_name', 'public.users.email', 'omh.hub_memberships.role').from('omh.hub_memberships')
        .leftJoin('public.users', 'omh.hub_memberships.user_id', 'public.users.id')
        .whereRaw('lower(omh.hub_memberships.hub_id) = ?', hub_id.toLowerCase());
    }
};
