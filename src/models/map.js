// @flow
var knex = require('../connection');
var Promise = require('bluebird');
var debug = require('../services/debug')('models/map');
var forEachRight = require('lodash.foreachright');

module.exports = {

  /**
   * Can include private?: Yes
   */
  getMap(map_id: number, trx: any){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.maps')
    .select(knex.raw(
      `map_id, title, position, style, basemap, private, created_by,
      created_at, updated_by, updated_at, views,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`
   ))
    .where({map_id})
    .then(function(result) {
      if (result && result.length == 1) {
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
      created_at, updated_by, updated_at, views,
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
      knex.raw('timezone(\'UTC\', omh.layers.last_updated) as last_updated'),
      knex.raw('timezone(\'UTC\', omh.layers.creation_time) as creation_time'),
      'omh.layers.views',
      'omh.layers.style','omh.layers.labels', 'omh.layers.settings',
      'omh.layers.legend_html', 'omh.layers.extent_bbox', 'omh.layers.preview_position',
      'omh.layers.updated_by_user_id', 'omh.layers.created_by_user_id',
      'omh.map_layers.style as map_style',
      'omh.map_layers.labels as map_labels',
      'omh.map_layers.settings as map_settings',
      'omh.map_layers.position as position',
      'omh.map_layers.legend_html as map_legend_html',
      'omh.map_layers.map_id as map_id')
      .from('omh.maps')
      .leftJoin('omh.map_layers', 'omh.maps.map_id', 'omh.map_layers.map_id')
      .leftJoin('omh.layers', 'omh.map_layers.layer_id', 'omh.layers.layer_id')
      .where('omh.maps.map_id', map_id).orderBy('position');
      if(!includePrivateLayers){
        query.where('omh.layers.private', false);
      }
      return query;
  },

  isPrivate(map_id: number){
  return knex.select('private').from('omh.maps').where({map_id})
    .then(function(result) {
      if (result && result.length == 1) {
        return result[0].private;
      }
      //else
      return true; //if we don't find the layer, assume it should be private
    });
  },

  allowedToModify(map_id: number, user_id: number){
    return this.getMap(map_id)
      .then(function(map){
          //FIXME: use the user_maps table instead
          if(map.created_by === user_id){
            return true;
          }
          return false;
      });
    },

    /**
     * Can include private?: No
     */
    getAllMaps(){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at', 'omh.user_maps.user_id',
        knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
        knex.raw('timezone(\'UTC\', omh.maps.updated_at) as updated_at'), 'omh.maps.views',
        'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('omh.user_maps', 'omh.maps.map_id', 'omh.user_maps.map_id')
        .leftJoin('public.users', 'public.users.id', 'omh.user_maps.user_id')
         .where('omh.maps.private', false)
        .whereNotNull('omh.user_maps.map_id')
        .orderBy('omh.maps.updated_at', 'desc');
    },

    /**
     * Can include private?: No
     */
    getFeaturedMaps(number: number=10){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at', 'omh.user_maps.user_id',
        knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
        knex.raw('timezone(\'UTC\', omh.maps.updated_at) as updated_at'), 'omh.maps.views',
         'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('omh.user_maps', 'omh.maps.map_id', 'omh.user_maps.map_id')
        .leftJoin('public.users', 'public.users.id', 'omh.user_maps.user_id')
        .whereNotNull('omh.user_maps.map_id')
        .where('omh.maps.featured', true).where('omh.maps.private', false)
        .orderBy('omh.maps.updated_at', 'desc')
        .limit(number);
    },

    /**
     * Can include private?: No
     */
    getPopularMaps(number: number=10){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at', 'omh.user_maps.user_id',
        knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
        knex.raw('timezone(\'UTC\', omh.maps.updated_at) as updated_at'), 'omh.maps.views',
        'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('omh.user_maps', 'omh.maps.map_id', 'omh.user_maps.map_id')
        .leftJoin('public.users', 'public.users.id', 'omh.user_maps.user_id')
        .where('omh.maps.private', false)
        .whereNotNull('omh.user_maps.map_id')
        .whereNotNull('views')
        .orderBy('views', 'desc')
        .limit(number);
    },

  /**
   * Can include private?: No
   */
    getRecentMaps(number: number=10){
      return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
        'omh.maps.updated_at', 'omh.user_maps.user_id',
        knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
        knex.raw('timezone(\'UTC\', omh.maps.updated_at) as updated_at'), 'omh.maps.views',
        'public.users.display_name as username')
        .from('omh.maps')
        .leftJoin('omh.user_maps', 'omh.maps.map_id', 'omh.user_maps.map_id')
        .leftJoin('public.users', 'public.users.id', 'omh.user_maps.user_id')
        .where('omh.maps.private', false)
        .whereNotNull('omh.user_maps.map_id')
        .orderBy('omh.maps.updated_at', 'desc')
        .limit(number);
    },

  /**
   * Can include private?: Yes
   */
  getUserMaps(user_id: number){
    return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
      'omh.maps.updated_at', 'omh.user_maps.user_id',
      knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
      knex.raw('timezone(\'UTC\', omh.maps.updated_at) as updated_at'), 'omh.maps.views',
      'public.users.display_name as username')
      .from('omh.maps')
      .leftJoin('omh.user_maps', 'omh.maps.map_id', 'omh.user_maps.map_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_maps.user_id')
      .where('omh.user_maps.user_id', user_id);
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
    to_tsvector('english', title) @@ plainto_tsquery('` + input + `')
    OR to_tsvector('spanish', title) @@ plainto_tsquery('` + input + `')
    OR to_tsvector('french', title) @@ plainto_tsquery('` + input + `')
    OR to_tsvector('italian', title) @@ plainto_tsquery('` + input + `')
    )
    `))
    .orderBy('title');
  },

  /**
   * Can include private?: No
   */
  getSearchResults(input: string) {
    input = input.toLowerCase();
    return knex.select('omh.maps.map_id', 'omh.maps.title', 'omh.maps.private',
      'omh.maps.updated_at', 'omh.user_maps.user_id', 
      knex.raw('md5(lower(trim(public.users.email))) as emailhash'),
      knex.raw('timezone(\'UTC\', omh.maps.updated_at) as updated_at'), 'omh.maps.views',
      'public.users.display_name as username')
      .from('omh.maps')
      .leftJoin('omh.user_maps', 'omh.maps.map_id', 'omh.user_maps.map_id')
      .leftJoin('public.users', 'public.users.id', 'omh.user_maps.user_id')
      .whereNotNull('omh.user_maps.map_id')
      .where(knex.raw(`
      omh.maps.private = false
      AND ( 
      to_tsvector('english', title) @@ plainto_tsquery('` + input + `')
      OR to_tsvector('spanish', title) @@ plainto_tsquery('` + input + `')
      OR to_tsvector('french', title) @@ plainto_tsquery('` + input + `')
      OR to_tsvector('italian', title) @@ plainto_tsquery('` + input + `')
      )
      `))
      .orderBy('omh.maps.title')
      .orderBy('omh.maps.updated_at', 'desc');
  },

  createMap(layers: Array<Object>, style: any, basemap: string, position: any, title: string, user_id: number, isPrivate: boolean){
   if(layers && Array.isArray(layers) && layers.length > 0){
    if(!isPrivate){
      //confirm no private layers
      layers.forEach(function(layer){
        if(layer.private) throw new Error('Private layer not allowed in public map');
      });
    }
   }
    return knex.transaction(function(trx) {
    return trx('omh.maps')
      .insert({
          position,
          style,
          basemap,
          title,
          private: isPrivate,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
      }).returning('map_id')
      .then(function(result){
        var map_id = result[0];
        debug('Created Map with ID: ' + map_id);
        //insert layers
        var mapLayers = [];
        if(layers && Array.isArray(layers) && layers.length > 0){
          layers.forEach(function(layer: Object, i: number){
            var mapStyle = layer.map_style ? layer.map_style : layer.style;
            var mapLabels = layer.map_labels ? layer.map_labels : layer.labels;
            var mapLegend = layer.map_legend_html ? layer.map_legend_html : layer.legend_html;
            var mapSettings = layer.map_settings ? layer.map_settings : layer.settings;
            mapLayers.push({
              map_id,
              layer_id: layer.layer_id,
              style: mapStyle,
              labels: mapLabels,
              legend_html: mapLegend,
              settings: mapSettings,
              position: i
            });
          });
        }
        return trx('omh.map_layers')
        .insert(mapLayers)
        .then(function(){
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
    ]).then(function(results){
      var map = results[0];
      var layers = results[1];
      var title = map.title + ' - Copy';
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
    ]).then(function(results){
      var map = results[0];
      var layers = results[1];
      var title = map.title + ' - Copy';
      return _this.createGroupMap(layers, map.style, map.basemap, map.position, title, user_id, to_group_id);
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
      .then(function(map){
        if(map.private && !isPrivate){
          //private to public
          return _this.getMapLayers(map_id).then(function(layers){
            if(layers && Array.isArray(layers) && layers.length > 0){
              if(!isPrivate){
                //confirm no private layers
                layers.forEach(function(layer){
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

  updateMap(map_id: number, layers: Array<Object>, style: Object, basemap: string, position: any, title: string, user_id: number){
    return knex.transaction(function(trx) {
      return trx('omh.maps')
        .update({position, style, basemap, title,
            updated_by: user_id,
            updated_at: knex.raw('now()'),
            screenshot: null,
            thumbnail: null
        }).where({map_id})
        .then(function(){
          debug('Updated Map with ID: ' + map_id);
          //remove previous layers
          return trx('omh.map_layers').where({map_id}).del()
          .then(function(){
            //insert layers
            var mapLayers = [];
            layers.forEach(function(layer, i){
              var mapStyle = layer.map_style ? layer.map_style : layer.style;
              var mapLabels = layer.map_labels ? layer.map_labels : layer.labels;
              var mapLegend = layer.map_legend_html ? layer.map_legend_html : layer.legend_html;
              var mapSettings = layer.map_settings ? layer.map_settings : layer.settings;
              mapLayers.push({
                map_id,
                layer_id: layer.layer_id,
                style: mapStyle,
                labels: mapLabels,
                legend_html: mapLegend,
                settings: mapSettings,
                position: i
              });
            });
            return trx('omh.map_layers').insert(mapLayers)
            .then(function(result){
              debug('Updated Map Layers with MapID: ' + map_id);
              return result;
            });
            });
          });
      });
  },

  deleteMap(map_id: number){
    return knex.transaction(function(trx) {
      return trx('omh.map_views').where({map_id}).del()
      .then(function(){
        return trx('omh.user_maps').where({map_id}).del()
        .then(function(){
          return trx('omh.story_maps').where({map_id}).del()
          .then(function(){
            return trx('omh.map_layers').where({map_id}).del()
            .then(function(){
              return trx('omh.maps').where({map_id}).del();
            });
          });
        });
      });
    });
  },

  createUserMap(layers: Array<Object>, style: Object, basemap: string, position: any, title: string, user_id: number, isPrivate: boolean){
    return this.createMap(layers, style, basemap, position, title, user_id, isPrivate)
    .then(function(result){
      debug(result);
      var map_id = result;
      debug('Saving User Map with ID: ' + map_id);
      return knex('omh.maps').update({owned_by_user_id: user_id}).where({map_id})
      .then(function(){
        return map_id; //pass on the new map_id
      });
    });
  },

  createGroupMap(layers: Array<Object>, style: Object, basemap: string, position: any, title: string, user_id: number, group_id: string, isPrivate: boolean){
    if(layers && Array.isArray(layers) && layers.length > 0){
    if(isPrivate){
        //confirm all private layers owned by same group
        layers.forEach(function(layer){
          if(layer.owned_by_group_id !== group_id) throw new Error('Private layers must be owned by the same group');
        });
      }
   }
    return this.createMap(layers, style, basemap, position, title, user_id, isPrivate)
    .then(function(result){
      debug(result);
      var map_id = result;
      debug('Saving User Map with ID: ' + map_id);
      return knex('omh.maps').update({owned_by_group_id: group_id}).where({map_id})
      .then(function(){
        return map_id; //pass on the new map_id
      });
    });
  },

  saveHubMap(layers: Array<Object>, style: Object, basemap: string, position: any, hub_id: string, user_id: number){
    return knex.transaction(function(trx) {
      return trx('omh.hubs')
      .update({
        map_style: style,
        basemap,
        map_position: position,
        updated_by: user_id,
        updated_at: knex.raw('now()')
      }).where({hub_id})
      .then(function(){
        return trx('omh.hub_layers').where({hub_id}).del()
        .then(function(){
          var commands = [];
          layers.forEach(function(layer, i){
            var mapStyle = layer.map_style ? layer.map_style : layer.style;
            var mapLabels = layer.map_labels ? layer.map_labels : layer.labels;
            var mapLegend = layer.map_legend_html ? layer.map_legend_html : layer.legend_html;
            var mapSettings = layer.map_settings ? layer.map_settings : layer.settings;
            commands.push(trx('omh.hub_layers')
            .insert({hub_id, layer_id: layer.layer_id, style: mapStyle, labels: mapLabels, legend_html: mapLegend, settings: mapSettings, active: layer.active, position: i}));
          });
          return Promise.all(commands);
        });
      });
    });
  },
  //TODO: this code is duplicated in MapStore, need to bring then back together
  buildMapStyle(layers: Array<Object>){
    var mapStyle = {
      sources: {},
      layers: []
    };

    //reverse the order for the styles, since the map draws them in the order received
    forEachRight(layers, function(layer){
      if(layer.map_style && layer.map_style.sources && layer.map_style.layers){
        //check for active flag and update visibility in style
        if(layer.active != undefined && layer.active == false){
          //hide style layers for this layer
          layer.map_style.layers.forEach(function(styleLayer){
            styleLayer['layout'] = {
              "visibility": "none"
            };
          });
        } else {
          //reset all the style layers to visible
          layer.map_style.layers.forEach(function(styleLayer){
            styleLayer['layout'] = {
              "visibility": "visible"
            };
          });
        }
        //add source
        mapStyle.sources = Object.assign(mapStyle.sources, layer.map_style.sources);
        //add layers
        mapStyle.layers = mapStyle.layers.concat(layer.map_style.layers);
      } else {
        debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
      }

    });

    return mapStyle;
  }

};
