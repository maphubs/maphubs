import MapStyles from '../components/Map/Styles'
import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Group from './group'
import shortid from 'shortid'
import { LocalizedString } from '../types/LocalizedString'

const debug = DebugService('models/map')

export default {
  /**
   * Can include private?: Yes
   */
  async getMap(map_id: number, trx?: any): Promise<any> {
    const db = trx || knex

    const result = await db('omh.maps')
      .select(
        knex.raw(`map_id, title, position, style, settings, basemap, private, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id,
      share_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`)
      )
      .where({
        map_id
      })

    if (result && result.length === 1) {
      return result[0]
    }

    return null
  },

  /**
   * Can include private?: Yes
   */
  getGroupMaps(
    owned_by_group_id: number,
    includePrivate: boolean,
    trx?: any
  ): any {
    const db = trx || knex

    const query = db('omh.maps')
      .select(
        knex.raw(`map_id, title, position, style, basemap, private, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`)
      )
      .where({
        owned_by_group_id
      })

    if (!includePrivate) {
      query.where({
        private: false
      })
    }

    return query
  },

  /**
   * Can include private?: Yes
   */
  async getMapLayers(
    map_id: number,
    includePrivateLayers: boolean,
    trx?: any
  ): Promise<any> {
    const db = trx || knex
    const query = db
      .select(
        'omh.layers.layer_id',
        'omh.layers.shortid',
        'omh.layers.name',
        'omh.layers.description',
        'omh.layers.data_type',
        'omh.layers.remote',
        'omh.layers.remote_host',
        'omh.layers.remote_layer_id',
        'omh.layers.status',
        'omh.layers.published',
        'omh.layers.source',
        'omh.layers.license',
        'omh.layers.presets',
        'omh.layers.is_external',
        'omh.layers.external_layer_type',
        'omh.layers.external_layer_config',
        'omh.layers.disable_export',
        'omh.layers.is_empty',
        'omh.layers.owned_by_group_id',
        knex.raw("timezone('UTC', omh.layers.last_updated) as last_updated"),
        knex.raw("timezone('UTC', omh.layers.creation_time) as creation_time"),
        'omh.layers.views',
        'omh.layers.style as default_style',
        'omh.layers.labels as default_labels',
        'omh.layers.settings as default_settings',
        'omh.layers.legend_html as default_legend_html',
        'omh.layers.extent_bbox',
        'omh.layers.preview_position',
        'omh.layers.updated_by_user_id',
        'omh.layers.created_by_user_id',
        'omh.map_layers.style as style',
        'omh.map_layers.labels as labels',
        'omh.map_layers.settings as settings',
        'omh.map_layers.position as position',
        'omh.map_layers.legend_html as legend_html',
        'omh.map_layers.map_id as map_id'
      )
      .from('omh.maps')
      .leftJoin('omh.map_layers', 'omh.maps.map_id', 'omh.map_layers.map_id')
      .leftJoin('omh.layers', 'omh.map_layers.layer_id', 'omh.layers.layer_id')
      .where('omh.maps.map_id', map_id)
      .orderBy('position')

    if (!includePrivateLayers) {
      query.where('omh.layers.private', false)
    }

    const layers = await query
    layers.map((layer) => {
      // repair layer settings if not set
      const active = MapStyles.settings.get(layer.style, 'active')

      if (typeof active === 'undefined') {
        layer.style = MapStyles.settings.set(layer.style, 'active', true)
      }
    })
    return layers
  },

  async isPrivate(map_id: number): Promise<boolean> {
    const result = await knex.select('private').from('omh.maps').where({
      map_id
    })

    if (result && result.length === 1) {
      return result[0].private
    }

    return true // if we don't find the layer, assume it should be private
  },

  async allowedToModify(map_id: number, user_id: number): Promise<any> {
    const map = await this.getMap(map_id)
    return Group.allowedToModify(map.owned_by_group_id, user_id)
  },

  getMapsBaseQuery(trx?: any): any {
    const db = trx || knex
    return db
      .select(
        'omh.maps.map_id',
        'omh.maps.title',
        'omh.maps.private',
        'omh.maps.share_id',
        'omh.maps.owned_by_group_id',
        knex.raw("timezone('UTC', omh.maps.updated_at) as updated_at"),
        'omh.maps.views'
      )
      .from('omh.maps')
  },

  /**
   * Can include private?: No
   */
  getAllMaps(trx?: any): any {
    const query = this.getMapsBaseQuery(trx)
    return query
      .where('omh.maps.private', false)
      .whereRaw("omh.maps.title -> 'en' <> '\"\"'")
  },

  /**
   * Can include private?: No
   */
  getFeaturedMaps(number: number = 10): any {
    const query = this.getMapsBaseQuery()
    return query
      .where('omh.maps.featured', true)
      .where('omh.maps.private', false)
      .orderBy('omh.maps.updated_at', 'desc')
      .limit(number)
  },

  /**
   * Can include private?: No
   */
  getPopularMaps(number: number = 10): any {
    const query = this.getMapsBaseQuery()
    return query
      .where('omh.maps.private', false)
      .whereNotNull('omh.maps.views')
      .orderBy('omh.maps.views', 'desc')
      .limit(number)
  },

  /**
   * Can include private?: No
   */
  getRecentMaps(number: number = 10): any {
    const query = this.getMapsBaseQuery()
    return query
      .where('omh.maps.private', false)
      .orderBy('omh.maps.updated_at', 'desc')
      .limit(number)
  },

  /**
   * Can include private?: Yes
   */
  getUserMaps(user_id: number): any {
    return knex
      .select(
        'omh.maps.map_id',
        'omh.maps.title',
        'omh.maps.private',
        'omh.maps.updated_at',
        'omh.maps.share_id',
        'omh.maps.owned_by_group_id',
        knex.raw("timezone('UTC', omh.maps.updated_at) as updated_at"),
        'omh.maps.views'
      )
      .from('omh.maps')
      .leftJoin(
        'omh.groups',
        'omh.maps.owned_by_group_id',
        'omh.groups.group_id'
      )
      .whereIn('omh.groups.group_id', function () {
        this.select('group_id').from('omh.group_memberships').where({
          user_id
        })
      })
  },

  /**
   * Can include private?: No
   */
  getSearchSuggestions(input: string): any {
    input = input.toLowerCase()
    return knex
      .select('title', 'map_id')
      .table('omh.maps')
      .where(
        knex.raw(
          `
    private = false
    AND (
    to_tsvector('english', (title -> 'en')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('spanish', (title -> 'es')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('french', (title -> 'fr')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('italian', (title -> 'it')::text) @@ plainto_tsquery(:input)
    )
    `,
          {
            input
          }
        )
      )
      .orderBy('title')
  },

  /**
   * Can include private?: No
   */
  getSearchResults(input: string): any {
    input = input.toLowerCase()
    const query = this.getMapsBaseQuery()
    return query
      .where(
        knex.raw(
          `
      omh.maps.private = false
      AND ( 
      to_tsvector('english', (title -> 'en')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('spanish', (title -> 'es')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('french', (title -> 'fr')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('italian', (title -> 'it')::text) @@ plainto_tsquery(:input)
      )
      `,
          {
            input
          }
        )
      )
      .orderBy('omh.maps.title')
      .orderBy('omh.maps.updated_at', 'desc')
  },

  async createMap(
    layers: Array<Record<string, any>>,
    style: any,
    basemap: string,
    position: any,
    title: string,
    settings: Record<string, any>,
    user_id: number,
    isPrivate: boolean,
    trx?: any
  ): Promise<any> {
    const db = trx || knex

    if (layers?.length > 0) {
      if (!isPrivate) {
        // confirm no private layers
        layers.forEach((layer) => {
          if (layer.private)
            throw new Error('Private layer not allowed in public map')
        })
      }
    }

    const result = await db('omh.maps')
      .insert({
        position,
        style,
        basemap,
        title,
        settings,
        private: isPrivate,
        created_by: user_id,
        created_at: db.raw('now()'),
        updated_by: user_id,
        updated_at: db.raw('now()')
      })
      .returning('map_id')
    const map_id = result[0]
    debug.log('Created Map with ID: ' + map_id)
    // insert layers
    const mapLayers = []

    if (layers?.length > 0) {
      layers.forEach((layer: Record<string, any>, i: number) => {
        mapLayers.push({
          map_id,
          layer_id: layer.layer_id,
          style: layer.style,
          labels: layer.labels,
          legend_html: layer.legend_html,
          position: i
        })
      })
    }

    console.log(mapLayers)
    await db('omh.map_layers').insert(mapLayers)
    return map_id
  },

  /**
   * Create a new map as a copy of the requested map an assign to the requested group
   * Can include private?: If requested
   */
  async copyMapToGroup(
    map_id: number,
    to_group_id: string,
    user_id: number,
    title?: LocalizedString
  ): Promise<any> {
    const map = await this.getMap(map_id)
    const layers = await this.getMapLayers(map_id)
    const copyTitle = title || map.title
    return knex.transaction(async (trx) => {
      return this.createGroupMap(
        layers,
        map.style,
        map.basemap,
        map.position,
        copyTitle,
        map.settings,
        user_id,
        to_group_id,
        map.private,
        trx
      )
    })
  },

  transferMapToGroup(map_id: number, group_id: string, user_id: number): any {
    return knex('omh.maps')
      .update({
        owned_by_group_id: group_id,
        updated_by: user_id,
        updated_at: knex.raw('now()')
      })
      .where({
        map_id
      })
  },

  async setPrivate(
    map_id: string,
    isPrivate: boolean,
    user_id: number
  ): Promise<any> {
    const map = await this.getMap(map_id)

    if (map.private && !isPrivate) {
      // private to public
      const layers = await this.getMapLayers(map_id)

      if (layers?.length > 0) {
        // confirm no private layers
        for (const layer of layers) {
          if (layer.private)
            throw new Error('Private layer not allowed in public map')
        }
      }

      return knex('omh.maps')
        .where('map_id', map_id)
        .update({
          private: isPrivate,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        })
    } else if (!map.private && isPrivate) {
      // public to private - just update
      return knex('omh.maps')
        .where('map_id', map_id)
        .update({
          private: isPrivate,
          updated_by: user_id,
          updated_at: knex.raw('now()')
        })
    } else {
      // not changing
      return null
    }
  },

  async updateMap(
    map_id: number,
    layers: Array<Record<string, any>>,
    style: Record<string, any>,
    basemap: string,
    position: any,
    title: string,
    settings: Record<string, any>,
    user_id: number
  ): Promise<any> {
    return knex.transaction(async (trx) => {
      await trx('omh.maps')
        .update({
          position,
          style,
          basemap,
          title,
          settings,
          updated_by: user_id,
          updated_at: knex.raw('now()'),
          screenshot: null,
          thumbnail: null
        })
        .where({
          map_id
        })
      debug.log('Updated Map with ID: ' + map_id)
      // remove previous layers
      await trx('omh.map_layers')
        .where({
          map_id
        })
        .del()
      // insert layers
      const mapLayers = []
      layers.forEach((layer, i) => {
        mapLayers.push({
          map_id,
          layer_id: layer.layer_id,
          style: layer.style,
          labels: layer.labels,
          legend_html: layer.legend_html,
          position: i
        })
      })
      const result = await trx('omh.map_layers').insert(mapLayers)
      debug.log('Updated Map Layers with MapID: ' + map_id)
      return result
    })
  },

  async deleteMap(map_id: number): Promise<any> {
    return knex.transaction(async (trx) => {
      await trx('omh.map_views')
        .where({
          map_id
        })
        .del()
      await trx('omh.user_maps')
        .where({
          map_id
        })
        .del() // keep until all user maps migrated

      await trx('omh.story_maps')
        .where({
          map_id
        })
        .del() // keep until all story maps migrated

      await trx('omh.map_layers')
        .where({
          map_id
        })
        .del()
      await trx('omh.maps')
        .where({
          map_id
        })
        .del()
    })
  },

  async createGroupMap(
    layers: Array<Record<string, any>>,
    style: Record<string, any>,
    basemap: string,
    position: any,
    title: string,
    settings: Record<string, any>,
    user_id: number,
    group_id: string,
    isPrivate: boolean,
    trx?: any
  ): Promise<any> {
    const db = trx || knex

    if (layers && Array.isArray(layers) && layers.length > 0 && isPrivate) {
      // confirm all private layers owned by same group
      for (const layer of layers) {
        if (layer.owned_by_group_id !== group_id)
          throw new Error('Private layers must be owned by the same group')
      }
    }

    const map_id = await this.createMap(
      layers,
      style,
      basemap,
      position,
      title,
      settings,
      user_id,
      isPrivate,
      db
    )
    debug.log('Saving User Map with ID: ' + map_id)
    await db('omh.maps')
      .update({
        owned_by_group_id: group_id
      })
      .where({
        map_id
      })
    return map_id // pass on the new map_id
  },

  async getMapByShareId(share_id: string, trx?: any): Promise<any> {
    const db = trx || knex
    const result = await db('omh.maps')
      .select(
        knex.raw(`map_id, title, position, style, settings, basemap, private, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id,
      share_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`)
      )
      .where({
        share_id
      })

    if (result && result.length === 1) {
      return result[0]
    }

    return null
  },

  async addPublicShareID(map_id: number, trx?: any): Promise<any> {
    const db = trx || knex
    const share_id = shortid.generate()
    await db('omh.maps')
      .update({
        share_id
      })
      .where({
        map_id
      })
    return share_id
  },

  async removePublicShareID(map_id: number, trx?: any): Promise<any> {
    const db = trx || knex
    return db('omh.maps')
      .update({
        share_id: null
      })
      .where({
        map_id
      })
  }
}
