// @flow
var knex = require('../connection');
var Promise = require('bluebird');
var debug = require('../services/debug')('models/map');
var Group = require('./group');
var MapStyles = require('../components/Map/Styles');

module.exports = {

  /**
   * Can include private?: Yes
   */
  getMap(map_id: number, trx: any){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.maps')
    .select(knex.raw(
      `map_id, title, position, style, settings, basemap, private, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id, owned_by_user_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`
   ))
    .where({map_id})
    .then((result) => {
      if (result && result.length === 1) {
        return result[0];
      }
      //else
      return null;
    });
  },

   /**
   * Can include private?: Yes
   */
  getGroupMaps(owned_by_group_id: number, includePrivate: boolean, trx: any){
    let db = knex;
    if(trx){db = trx;}
    var query = db('omh.maps')
    .select(knex.raw(
      `map_id, title, position, style, basemap, private, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id, owned_by_user_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`
   ))
    .where({owned_by_group_id});
    if(!includePrivate){
        query.where({private: false});
      }
    return query;
  },

  /**
   * Can include private?: Yes
   */
  getMapLayers(map_id: number, includePrivateLayers: boolean, trx: any){
    let db = knex;
    if(trx){db = trx;}
    var query = db.select(
      'omh.layers.layer_id', 'omh.layers.name', 'omh.layers.description', 'omh.layers.data_type',
      'omh.layers.remote', 'omh.layers.remote_host', 'omh.layers.remote_layer_id',
      'omh.layers.status', 'omh.layers.published', 'omh.layers.source', 'omh.layers.license', 'omh.layers.presets',
      'omh.layers.is_external', 'omh.layers.external_layer_type', 'omh.layers.external_layer_config', 'omh.layers.disable_export', 'omh.layers.is_empty',
      'omh.layers.owned_by_group_id',
      knex.raw(`timezone('UTC', omh.layers.last_updated) as last_updated`),
      knex.raw(`timezone('UTC', omh.layers.creation_time) as creation_time`),
      'omh.layers.views',
      'omh.layers.style as default_style','omh.layers.labels as default_labels', 'omh.layers.settings as default_settings',
      'omh.layers.legend_html as default_legend_html', 'omh.layers.extent_bbox', 'omh.layers.preview_position',
      'omh.layers.updated_by_user_id', 'omh.layers.created_by_user_id',
      'omh.map_layers.style as style',
      'omh.map_layers.labels as labels',
      'omh.map_layers.settings as settings',
      'omh.map_layers.position as position',
      'omh.map_layers.legend_html as legend_html',
      'omh.map_layers.map_id as map_id')
      .from('omh.maps')
      .leftJoin('omh.map_layers', 'omh.maps.map_id', 'omh.map_layers.map_id')
      .leftJoin('omh.layers', 'omh.map_layers.layer_id', 'omh.layers.layer_id')
      .where('omh.maps.map_id', map_id).orderBy('position');
      if(!includePrivateLayers){
        query.where('omh.layers.private', false);
      }
      return query.then(layers =>{
         layers.map(layer=>{
          //repair layer settings if not set
          let active = MapStyles.settings.get(layer.style, 'active');
          if(typeof active === 'undefined'){
            layer.style = MapStyles.settings.set(layer.style, 'active', true);
          }
        });
        return layers;
      });
  },

  isPrivate(map_id: number){
  return knex.select('private').from('omh.maps').where({map_id})
    .then((result) => {
      if (result && result.length === 1) {
        return result[0].private;
      }
      //else
      return true; //if we don't find the layer, assume it should be private
    });
  },

  allowedToModify(map_id: number, user_id: number){
    return this.getMap(map_id)
      .then((map) => {
        if(map.owned_by_user_id && map.owned_by_user_id === user_id){
          return true;
        }else if(map.owned_by_group_id){
          return Group.allowedToModify(map.owned_by_group_id, user_id);
        }else{
          return false;
        }
      });
    },

    /**
     * Can include private?: No
     */
    getAllMaps(trx: any){
      let db = knex;
      if(trx){db = trx;}
      return db.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at',
        'omh.maps.owned_by_group_id', 'omh.maps.owned_by_user_id',
        db.raw(`md5(lower(trim(public.users.email))) as emailhash`),
        db.raw(`timezone('UTC', omh.maps.updated_at) as updated_at`), 'omh.maps.views',
        'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('public.users', 'public.users.id', 'omh.maps.owned_by_user_id')
         .where('omh.maps.private', false);
    },

    /**
     * Can include private?: No
     */
    getFeaturedMaps(number: number=10){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at',
        'omh.maps.owned_by_group_id', 'omh.maps.owned_by_user_id',
        knex.raw(`md5(lower(trim(public.users.email))) as emailhash`),
        knex.raw(`timezone('UTC', omh.maps.updated_at) as updated_at`), 'omh.maps.views',
         'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('public.users', 'public.users.id', 'omh.maps.owned_by_user_id')
        .where('omh.maps.featured', true).where('omh.maps.private', false)
        .orderBy('omh.maps.updated_at', 'desc')
        .limit(number);
    },

    /**
     * Can include private?: No
     */
    getPopularMaps(number: number=10){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at',
        'omh.maps.owned_by_group_id', 'omh.maps.owned_by_user_id',
        knex.raw(`md5(lower(trim(public.users.email))) as emailhash`),
        knex.raw(`timezone('UTC', omh.maps.updated_at) as updated_at`), 'omh.maps.views',
        'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('public.users', 'public.users.id', 'omh.maps.owned_by_user_id')
        .where('omh.maps.private', false)
        .whereNotNull('views')
        .orderBy('views', 'desc')
        .limit(number);
    },

  /**
   * Can include private?: No
   */
    getRecentMaps(number: number=10){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at',
        'omh.maps.owned_by_group_id', 'omh.maps.owned_by_user_id',
        knex.raw(`md5(lower(trim(public.users.email))) as emailhash`),
        knex.raw(`timezone('UTC', omh.maps.updated_at) as updated_at`), 'omh.maps.views',
        'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('public.users', 'public.users.id', 'omh.maps.owned_by_user_id')
        .where('omh.maps.private', false)
        .orderBy('omh.maps.updated_at', 'desc')
        .limit(number);
    },

  /**
   * Can include private?: Yes
   */
  getUserMaps(user_id: number){
    return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
      'omh.maps.updated_at',
       'omh.maps.owned_by_group_id', 'omh.maps.owned_by_user_id',
      knex.raw(`md5(lower(trim(public.users.email))) as emailhash`),
      knex.raw(`timezone('UTC', omh.maps.updated_at) as updated_at`), 'omh.maps.views',
      'public.users.display_name as username')
      .from('omh.maps')
      .leftJoin('public.users', 'public.users.id', 'omh.maps.owned_by_user_id')
      .where('omh.maps.owned_by_user_id', user_id);
  },

  /**
   * Can include private?: No
   */
  getSearchSuggestions(input: string) {
    input = input.toLowerCase();
    return knex.select('title', 'map_id').table('omh.maps')
    .where(knex.raw(`
    private = false
    AND (
    to_tsvector('english', (title -> 'en')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('spanish', (title -> 'es')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('french', (title -> 'fr')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('italian', (title -> 'it')::text) @@ plainto_tsquery(:input)
    )
    `, {input}))
    .orderBy('title');
  },

  /**
   * Can include private?: No
   */
  getSearchResults(input: string) {
    input = input.toLowerCase();
    return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
      'omh.maps.updated_at',
      'omh.maps.owned_by_group_id', 'omh.maps.owned_by_user_id',
      knex.raw(`md5(lower(trim(public.users.email))) as emailhash`),
      knex.raw(`timezone('UTC', omh.maps.updated_at) as updated_at`), 'omh.maps.views',
      'public.users.display_name as username')
      .from('omh.maps')
      .leftJoin('public.users', 'public.users.id', 'omh.maps.owned_by_user_id')
      .where(knex.raw(`
      omh.maps.private = false
      AND ( 
      to_tsvector('english', (title -> 'en')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('spanish', (title -> 'es')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('french', (title -> 'fr')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('italian', (title -> 'it')::text) @@ plainto_tsquery(:input)
      )
      `, {input}))
      .orderBy('omh.maps.title')
      .orderBy('omh.maps.updated_at', 'desc');
  },

  createMap(layers: Array<Object>, style: any, basemap: string, position: any, title: string, settings: Object, user_id: number, isPrivate: boolean){
   if(layers && Array.isArray(layers) && layers.length > 0){
    if(!isPrivate){
      //confirm no private layers
      layers.forEach((layer) => {
        if(layer.private) throw new Error('Private layer not allowed in public map');
      });
    }
   }
    return knex.transaction((trx) => {
    return trx('omh.maps')
      .insert({
          position,
          style,
          basemap,
          title,
          settings,
          private: isPrivate,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
      }).returning('map_id')
      .then((result) => {
        var map_id = result[0];
        debug.log('Created Map with ID: ' + map_id);
        //insert layers
        var mapLayers = [];
        if(layers && Array.isArray(layers) && layers.length > 0){
          layers.forEach((layer: Object, i: number) => {
            mapLayers.push({
              map_id,
              layer_id: layer.layer_id,
              style: layer.style,
              labels: layer.labels,
              legend_html: layer.legend_html,
              position: i
            });
          });
        }
        return trx('omh.map_layers')
        .insert(mapLayers)
        .then(() => {
          return map_id;
        });
      });
    });
  },

  /**
   * Create a new map as a copy of the requested map an assign to the requested user
   * Can include private?: If requested
   */
  copyMapToUser(map_id: number, to_user_id: number){
    var _this = this;
    return Promise.all([
      this.getMap(map_id),
      this.getMapLayers(map_id)
    ]).then((results) => {
      var map = results[0];
      var layers = results[1];
      var title = map.title;
      return _this.createUserMap(layers, map.style, map.basemap, map.position, title, to_user_id);
    });
  },

  /**
   * Create a new map as a copy of the requested map an assign to the requested group
   * Can include private?: If requested
   */
  copyMapToGroup(map_id: number, to_group_id: string, user_id: number){
    var _this = this;
    return Promise.all([
      this.getMap(map_id),
      this.getMapLayers(map_id)
    ]).then((results) => {
      var map = results[0];
      var layers = results[1];
      var title = map.title;
      return _this.createGroupMap(layers, map.style, map.basemap, map.position, title, map.settings, user_id, to_group_id, map.private);
    });
  },

  transferMapToUser(map_id: number, to_user_id: number, user_id: number){
    return knex('omh.maps')
    .update({
      owned_by_user_id: to_user_id, 
      owned_by_group_id: null,
      updated_by: user_id,
      updated_at: knex.raw('now()')
    })
    .where({map_id});
  },

  transferMapToGroup(map_id: number, group_id: string, user_id: number){
     return knex('omh.maps')
    .update({
      owned_by_user_id: null, 
      owned_by_group_id: group_id,
      updated_by: user_id,
      updated_at: knex.raw('now()')
    })
    .where({map_id});
  },

  setPrivate(map_id: string, isPrivate: boolean, user_id: number) {
      var _this = this;
      return this.getMap(map_id)
      .then((map) => {
        if(map.private && !isPrivate){
          //private to public
          return _this.getMapLayers(map_id).then((layers) => {
            if(layers && Array.isArray(layers) && layers.length > 0){
              if(!isPrivate){
                //confirm no private layers
                layers.forEach((layer) => {
                  if(layer.private) throw new Error('Private layer not allowed in public map');
                });
              }
            }
            return knex('omh.maps')
            .where('map_id', map_id)
            .update({
              private: isPrivate,
              updated_by: user_id,
              updated_at: knex.raw('now()')
            });          
          });
        }else if(!map.private && isPrivate){
          //public to private - just update
          return knex('omh.maps')
          .where('map_id', map_id)
          .update({
            private: isPrivate,
            updated_by: user_id,
            updated_at: knex.raw('now()')
          });
        }else{
          //not changing
          return null;
        }
      });  
    },

  updateMap(map_id: number, layers: Array<Object>, style: Object, basemap: string, position: any, title: string, settings: Object, user_id: number){
    return knex.transaction((trx) => {
      return trx('omh.maps')
        .update({position, style, basemap, title, settings,
            updated_by: user_id,
            updated_at: knex.raw('now()'),
            screenshot: null,
            thumbnail: null
        }).where({map_id})
        .then(() => {
          debug.log('Updated Map with ID: ' + map_id);
          //remove previous layers
          return trx('omh.map_layers').where({map_id}).del()
          .then(() => {
            //insert layers
            var mapLayers = [];
            layers.forEach((layer, i) => {
              mapLayers.push({
                map_id,
                layer_id: layer.layer_id,
                style: layer.style,
                labels: layer.labels,
                legend_html: layer.legend_html,
                position: i
              });
            });
            return trx('omh.map_layers').insert(mapLayers)
            .then((result) => {
              debug.log('Updated Map Layers with MapID: ' + map_id);
              return result;
            });
            });
          });
      });
  },

  deleteMap(map_id: number){
    return knex.transaction((trx) => {
      return trx('omh.map_views').where({map_id}).del()
      .then(() => {
        return trx('omh.user_maps').where({map_id}).del() //keep until all user maps migrated
        .then(() => {
          return trx('omh.story_maps').where({map_id}).del() //keep until all story maps migrated
          .then(() => {
            return trx('omh.map_layers').where({map_id}).del()
            .then(() => {
              return trx('omh.maps').where({map_id}).del();
            });
          });
        });
      });
    });
  },

  createUserMap(layers: Array<Object>, style: Object, basemap: string, position: any, title: string, settings: Object, user_id: number, isPrivate: boolean){
    return this.createMap(layers, style, basemap, position, title, settings, user_id, isPrivate)
    .then((result) => {
      debug.log(result);
      var map_id = result;
      debug.log('Saving User Map with ID: ' + map_id);
      return knex('omh.maps').update({owned_by_user_id: user_id}).where({map_id})
      .then(() => {
        return map_id; //pass on the new map_id
      });
    });
  },

  createGroupMap(layers: Array<Object>, style: Object, basemap: string, position: any, title: string, settings: Object, user_id: number, group_id: string, isPrivate: boolean){
    if(layers && Array.isArray(layers) && layers.length > 0){
    if(isPrivate){
        //confirm all private layers owned by same group
        layers.forEach((layer) => {
          if(layer.owned_by_group_id !== group_id) throw new Error('Private layers must be owned by the same group');
        });
      }
   }
    return this.createMap(layers, style, basemap, position, title, settings, user_id, isPrivate)
    .then((result) => {
      debug.log(result);
      var map_id = result;
      debug.log('Saving User Map with ID: ' + map_id);
      return knex('omh.maps').update({owned_by_group_id: group_id}).where({map_id})
      .then(() => {
        return map_id; //pass on the new map_id
      });
    });
  }
};