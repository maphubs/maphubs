// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var Group = require('./group');
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
      //.where('omh.stories.published', true)
      .whereRaw(`omh.stories.published = true AND (omh.hubs.hub_id IS NULL OR omh.hubs.published = true )`)
      .leftJoin('omh.user_stories', 'omh.stories.story_id', 'omh.user_stories.story_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_stories.user_id')
      .leftJoin('omh.hub_stories', 'omh.stories.story_id', 'omh.hub_stories.story_id')
      .leftJoin('omh.hubs', 'omh.hubs.hub_id', 'omh.hub_stories.hub_id');
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
      .orderBy('omh.stories.updated_at', 'desc')
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
        .orderBy('omh.stories.updated_at', 'desc')
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
      .then((userStoryResult) => {
        if(userStoryResult && userStoryResult.length > 0){
          return userStoryResult[0];
        }else{
          return _this.getHubStoryById(story_id)
          .then((hubStoryResult) => {
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
      query.orderBy('updated_at', 'desc');
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
      .then(() => {
        return trx('omh.story_maps').where({story_id}).del()
        .then(() => {
          return trx('omh.hub_stories').where({story_id}).del()
          .then(() => {
            return trx('omh.user_stories').where({story_id}).del()
            .then(() => {
                return trx('omh.stories').where({story_id}).del();
            });
          });
        });
      });
    },

    createHubStory(hub_id: string, user_id: number) {
      return knex.transaction((trx) => {
        return trx('omh.stories').insert({
          user_id,
          published: false,
          created_at: knex.raw('now()'),
          updated_at: knex.raw('now()')
        }).returning('story_id')
        .then((story_id) => {
          story_id = parseInt(story_id);
          return trx('omh.hub_stories').insert({hub_id, story_id})
          .returning('story_id')
          .then((result) => {
            return result[0];
          });
        });
      });
    },

    createUserStory(user_id: number) {
      return knex.transaction((trx) => {
        return trx('omh.stories').insert({
          user_id,
          published: false,
          created_at: knex.raw('now()'),
          updated_at: knex.raw('now()')
        }).returning('story_id')
        .then((story_id) => {
          story_id = parseInt(story_id);
          return trx('omh.user_stories').insert({user_id, story_id})
          .returning('story_id')
          .then((result) => {
            return result[0];
          });
        });
      });
    },

    allowedToModify(story_id: number, user_id: number) {
      var _this = this;
      //look in both hub stories and user Stories
      return Promise.all([
        knex('omh.hub_stories').where({story_id}),
        knex('omh.user_stories').where({story_id})
      ]).then((results) => {
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
          if(parseInt(userStories[0].user_id) === parseInt(user_id)){
            debug('user: ' + user_id + ' is the owner of story: ' + story_id);
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

    getHubByID(hub_id: string) {
      debug('get hub: ' + hub_id);
      return knex('omh.hubs')
        .whereRaw('lower(hub_id) = ?', hub_id.toLowerCase())
        .then((hubResult) => {
          if (hubResult && hubResult.length === 1) {
              return hubResult[0];
          }
          //else
          return null;
        });
    },

    allowedToModifyHub(hub_id: string, user_id: number){
      debug("checking if user: " + user_id + " is allowed to modify hub: " + hub_id);
      return this.getHubByID(hub_id).then((hub) => {
        return Group.allowedToModify(hub.owned_by_group_id, user_id);
      });
    }

};
