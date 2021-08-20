import MapStyles from '../components/Maps/Map/Styles'
import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Group from './group'
import shortid from 'shortid'
import { LocalizedString } from '../types/LocalizedString'
import { Knex } from 'knex'
import { Map, MapPosition } from '../types/map'
import { Layer } from '../types/layer'
import mapboxgl from 'mapbox-gl'

const debug = DebugService('models/map')

export default {
  async getMap(map_id: number, trx?: Knex.Transaction): Promise<Map> {
    const db = trx || knex

    const result = await db('omh.maps')
      .select(
        knex.raw(`map_id, title, position, style, settings, basemap, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id,
      share_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`)
      )
      .where({
        map_id
      })

    if (result && result.length === 1) {
      return result[0] as Map
    }

    return null
  },

  getGroupMaps(
    owned_by_group_id: string,
    trx?: Knex.Transaction
  ): Knex.QueryBuilder {
    const db = trx || knex

    const query = db('omh.maps')
      .select(
        knex.raw(`map_id, title, position, style, basemap, created_by,
      created_at, updated_by, updated_at, views, owned_by_group_id,
     CASE WHEN screenshot IS NULL THEN FALSE ELSE TRUE END as has_screenshot`)
      )
      .where({
        owned_by_group_id
      })

    return query
  },

  async getMapLayers(map_id: number, trx?: Knex.Transaction): Promise<Layer[]> {
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

  async allowedToModify(map_id: number, user_id: number): Promise<boolean> {
    const map = await this.getMap(map_id)
    return Group.allowedToModify(map.owned_by_group_id, user_id)
  },

  getMapsBaseQuery(trx?: Knex.Transaction): Knex.QueryBuilder {
    const db = trx || knex
    return db
      .select(
        'omh.maps.map_id',
        'omh.maps.title',
        'omh.maps.share_id',
        'omh.maps.owned_by_group_id',
        knex.raw("timezone('UTC', omh.maps.updated_at) as updated_at"),
        'omh.maps.views'
      )
      .from('omh.maps')
  },

  getAllMaps(trx?: Knex.Transaction): Knex.QueryBuilder {
    const query = this.getMapsBaseQuery(trx)
    // FIXME: this appears to be an old hack to avoid loading incomplete or broken maps
    return query.whereRaw("omh.maps.title -> 'en' <> '\"\"'")
  },

  getFeaturedMaps(number = 10): Knex.QueryBuilder {
    const query = this.getMapsBaseQuery()
    return query
      .where('omh.maps.featured', true)
      .orderBy('omh.maps.updated_at', 'desc')
      .limit(number)
  },

  getRecentMaps(number = 10): Knex.QueryBuilder {
    const query = this.getMapsBaseQuery()
    return query.orderBy('omh.maps.updated_at', 'desc').limit(number)
  },

  getUserMaps(user_id: number): Knex.QueryBuilder {
    return knex
      .select(
        'omh.maps.map_id',
        'omh.maps.title',
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

  getSearchSuggestions(input: string): Knex.QueryBuilder {
    input = input.toLowerCase()
    return knex
      .select('title', 'map_id')
      .table('omh.maps')
      .where(
        knex.raw(
          `
    to_tsvector('english', (title -> 'en')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('spanish', (title -> 'es')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('french', (title -> 'fr')::text) @@ plainto_tsquery(:input)
    OR to_tsvector('italian', (title -> 'it')::text) @@ plainto_tsquery(:input)
    `,
          {
            input
          }
        )
      )
      .orderBy('title')
  },

  getSearchResults(input: string): Knex.QueryBuilder {
    input = input.toLowerCase()
    const query = this.getMapsBaseQuery()
    return query
      .where(
        knex.raw(
          `
      to_tsvector('english', (title -> 'en')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('spanish', (title -> 'es')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('french', (title -> 'fr')::text) @@ plainto_tsquery(:input)
      OR to_tsvector('italian', (title -> 'it')::text) @@ plainto_tsquery(:input)
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
    layers: Layer[],
    style: mapboxgl.Style,
    basemap: string,
    position: MapPosition,
    title: string,
    settings: Record<string, unknown>,
    user_id: number,
    trx?: Knex.Transaction
  ): Promise<number> {
    const db = trx || knex

    const result = await db('omh.maps')
      .insert({
        position,
        style,
        basemap,
        title,
        settings,
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
      // eslint-disable-next-line unicorn/no-array-for-each
      layers.forEach((layer: Layer, i: number) => {
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
   */
  async copyMapToGroup(
    map_id: number,
    to_group_id: string,
    user_id: number,
    title?: LocalizedString
  ): Promise<number> {
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
        trx
      )
    })
  },

  transferMapToGroup(
    map_id: number,
    group_id: string,
    user_id: number
  ): Knex.QueryBuilder {
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

  async updateMap(
    map_id: number,
    layers: Layer[],
    style: mapboxgl.Style,
    basemap: string,
    position: MapPosition,
    title: LocalizedString,
    settings: Record<string, unknown>,
    user_id: number
  ): Promise<number[]> {
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
      // eslint-disable-next-line unicorn/no-array-for-each
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

  async deleteMap(map_id: number): Promise<void> {
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
    layers: Layer[],
    style: mapboxgl.Style,
    basemap: string,
    position: MapPosition,
    title: LocalizedString,
    settings: Record<string, unknown>,
    user_id: number,
    group_id: string,
    trx?: Knex.Transaction
  ): Promise<number> {
    const db = trx || knex

    const map_id = await this.createMap(
      layers,
      style,
      basemap,
      position,
      title,
      settings,
      user_id,
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

  async getMapByShareId(
    share_id: string,
    trx?: Knex.Transaction
  ): Promise<Map | null> {
    const db = trx || knex
    const result = await db('omh.maps')
      .select(
        knex.raw(`map_id, title, position, style, settings, basemap, created_by,
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

  async addPublicShareID(
    map_id: number,
    trx?: Knex.Transaction
  ): Promise<string> {
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

  async removePublicShareID(
    map_id: number,
    trx?: Knex.Transaction
  ): Promise<number> {
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
