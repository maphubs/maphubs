// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var debug = require('../services/debug')('model/stats');

module.exports = {

  getLayerStats(layer_id: number){

    var queryViewsByDay = knex.select(knex.raw("date_trunc('day', time) as day"), knex.raw('count(view_id)'))
    .from('omh.layer_views')
    .groupBy(
      knex.raw("date_trunc('day', time)")
    ).orderBy(
      knex.raw("date_trunc('day', time)")
    );

    return Promise.all([
      knex('omh.map_layers').select(knex.raw('count(map_id)')).where({layer_id}),
      knex.select(knex.raw('count(story_id)'))
      .from('omh.story_maps')
      .leftJoin('omh.map_layers', 'omh.story_maps.map_id', 'omh.map_layers.map_id')
      .where({layer_id}),
      knex('omh.hub_layers').select(knex.raw('count(hub_id)')).where({layer_id}),
      queryViewsByDay

    ]).then(function(results){
      var stats = {
        maps: results[0][0].count,
        stories: results[1][0].count,
        hubs: results[2][0].count,
        viewsByDay: results[3]
      };
      return stats;
    });
  },

  addLayerView(layer_id: number, user_id: any){
    if(user_id <= 0){
      user_id = null;
    }
    return knex('omh.layer_views').select(knex.raw('count(view_id)')).where({layer_id})
    .then(function(viewsResult){
      var views: number = parseInt(viewsResult[0].count);
      if(views === undefined || isNaN(views)){
        views = 1;
      }else{
        views = views + 1;
      }
      return knex('omh.layer_views').insert({
        layer_id, user_id, time: knex.raw('now()')
      }).then(function(){
        debug("layer: " + layer_id + " now has " + views + " views!");
        return knex('omh.layers').update({views}).where({layer_id});
      });
    });
  },

  addMapView(map_id: number, user_id: any){
    if(user_id <= 0){
      user_id = null;
    }
    return knex('omh.map_views').select(knex.raw('count(view_id)')).where({map_id})
    .then(function(viewsResult){
      var views: number = parseInt(viewsResult[0].count);
      if(views === undefined || isNaN(views)){
        views = 1;
      }else{
        views = views + 1;
      }
      return knex('omh.map_views').insert({
        map_id, user_id, time: knex.raw('now()')
      }).then(function(){
        debug("map: " + map_id + " now has " + views + " views!");
        return knex('omh.maps').update({views}).where({map_id});
      });
    });
  },

  addStoryView(story_id: number, user_id: any){
    if(user_id <= 0){
      user_id = null;
    }
    return knex('omh.story_views').select(knex.raw('count(view_id)')).where({story_id})
    .then(function(viewsResult){
      var views: number = parseInt(viewsResult[0].count);
      if(views === undefined || isNaN(views)){
        views = 1;
      }else{
        views = views + 1;
      }
      return knex('omh.story_views').insert({
        story_id, user_id, time: knex.raw('now()')
      }).then(function(){
        debug("story: " + story_id + " now has " + views + " views!");
        return knex('omh.stories').update({views}).where({story_id});
      });
    });
  },

  addHubView(hub_id: string, user_id: any){
    if(user_id <= 0){
      user_id = null;
    }
    return knex('omh.hub_views').select(knex.raw('count(view_id)')).where({hub_id})
    .then(function(viewsResult){
      var views: number = parseInt(viewsResult[0].count);
      if(views === undefined || isNaN(views)){
        views = 1;
      }else{
        views = views + 1;
      }
      return knex('omh.hub_views').insert({
        hub_id, user_id, time: knex.raw('now()')
      }).then(function(){
        debug("hub: " + hub_id + " now has " + views + " views!");
        return knex('omh.hubs').update({views}).where({hub_id});
      });
    });
  }

};
