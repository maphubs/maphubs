import MapStyles from '../components/Maps/Map/Styles'
import type { Layer } from '../types/layer'
import knex from '../connection'
import dbgeo from 'dbgeo'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import _find from 'lodash.find'
import Presets from './presets'
import DataLoadUtils from '../services/data-load-utils'
import Group from './group'
import Map from './map'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import ScreenshotUtils from '../services/screenshot-utils'
import PhotoAttachment from './photo-attachment'
import shortid from 'shortid'
import Bluebird from 'bluebird'
import { Knex } from 'knex'

const debug = DebugService('model/layers')

export default {
  async getAllLayers(
    includeMapInfo: boolean,
    trx?: Knex.Transaction
  ): Promise<Layer[]> {
    let db = knex

    if (trx) {
      db = trx
    }

    return includeMapInfo
      ? db
          .select(
            'layer_id',
            'shortid',
            'name',
            'description',
            'data_type',
            'remote',
            'remote_host',
            'remote_layer_id',
            'status',
            'source',
            'license',
            'presets',
            'allow_public_submit',
            'is_external',
            'external_layer_type',
            'external_layer_config',
            'disable_export',
            'owned_by_group_id',
            db.raw("timezone('UTC', last_updated)::text as last_updated"),
            'views',
            'style',
            'legend_html',
            'labels',
            'settings',
            'extent_bbox',
            'preview_position'
          )
          .table('omh.layers')
          .where({
            private: false,
            status: 'published'
          })
          .orderByRaw("name -> 'en'")
      : db
          .select(
            'layer_id',
            'shortid',
            'name',
            'description',
            'data_type',
            'remote',
            'remote_host',
            'remote_layer_id',
            'status',
            'source',
            'license',
            'presets',
            'is_external',
            'external_layer_type',
            'external_layer_config',
            'disable_export',
            'owned_by_group_id',
            db.raw("timezone('UTC', last_updated)::text as last_updated"),
            'views'
          )
          .table('omh.layers')
          .where({
            private: false,
            status: 'published'
          })
          .orderByRaw("name -> 'en'")
  },

  async getRecentLayers(number = 15): Promise<Layer[]> {
    return knex
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'source',
        'license',
        'presets',
        'allow_public_submit',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated"),
        'views'
      )
      .table('omh.layers')
      .where({
        private: false,
        status: 'published'
      })
      .orderBy('last_updated', 'desc')
      .limit(number)
  },

  async getPopularLayers(number = 15): Promise<Layer[]> {
    // TODO switch to a count of map usage since we are removing view tracking
    /*
    const mapsResult = await knex('omh.map_layers')
      .select('layer_id', knex.raw('count(map_id) as mapCount'))
      .where({
        layer_id
      })
      */
    return knex
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'source',
        'license',
        'presets',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'allow_public_submit',
        'style',
        'legend_html',
        'labels',
        'settings',
        'extent_bbox',
        'preview_position',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated")
      )
      .table('omh.layers')
      .where({
        status: 'published'
      })
      .whereNotNull('omh.layers.views')
      .orderBy('omh.layers.views', 'desc')
      .limit(number)
  },

  async getFeaturedLayers(number = 15): Promise<Layer[]> {
    return knex
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'source',
        'license',
        'presets',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated"),
        'views'
      )
      .table('omh.layers')
      .where({
        private: false,
        status: 'published',
        featured: true
      })
      .orderByRaw("name -> 'en'")
      .limit(number)
  },

  async getLayerInfo(layer_id: number): Promise<Layer> {
    const result = await knex('omh.layers')
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'owned_by_group_id',
        'presets'
      )
      .where({
        layer_id
      })

    if (result && result.length === 1) {
      return result[0]
    }

    return null
  },

  async getLayerFeatureCount(layer_id: number): Promise<number> {
    const result = await knex(`layers.data_${layer_id}`).count('mhid')

    return result && Array.isArray(result) && result.length === 1
      ? Number.parseInt(result[0].count as string)
      : 0
  },

  getSearchSuggestions(input: string): Knex.QueryBuilder {
    input = input.toLowerCase()
    const query = knex
      .select('name', 'layer_id')
      .table('omh.layers')
      .where(
        knex.raw(
          `
      private = false AND status = 'published'
      AND (
      to_tsvector('english', COALESCE((name -> 'en')::text, '')
      || ' ' || COALESCE((description -> 'en')::text, '')
      || ' ' || COALESCE((source -> 'en')::text, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('spanish', COALESCE((name -> 'es')::text, '')
      || ' ' || COALESCE((description -> 'es')::text, '')
      || ' ' || COALESCE((source -> 'es')::text, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('french', COALESCE((name -> 'fr')::text, '')
      || ' ' || COALESCE((description -> 'fr')::text, '')
      || ' ' || COALESCE((source -> 'fr')::text, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('italian', COALESCE((name -> 'it')::text, '')
      || ' ' || COALESCE((description -> 'it')::text, '')
      || ' ' || COALESCE((source -> 'it')::text, '')) @@ plainto_tsquery(:input)
      )
      `,
          {
            input
          }
        )
      )
      .orderByRaw("name -> 'en'")
    return query
  },

  getSearchResults(input: string): Knex.QueryBuilder {
    input = input.toLowerCase()
    const query = knex('omh.layers')
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'source',
        'license',
        'presets',
        'style',
        'legend_html',
        'labels',
        'settings',
        'extent_bbox',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated"),
        'views'
      )
      .where(
        knex.raw(
          `
      private = false AND status = 'published'
      AND (
      to_tsvector('english',  COALESCE((name -> 'en')::text, '')
      || ' ' || COALESCE((description -> 'en')::text, '')
      || ' ' || COALESCE((source -> 'en')::text, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('spanish',  COALESCE((name -> 'es')::text, '')
      || ' ' || COALESCE((description -> 'es')::text, '')
      || ' ' || COALESCE((source -> 'es')::text, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('french',  COALESCE((name -> 'fr')::text, '')
      || ' ' || COALESCE((description -> 'fr')::text, '')
      || ' ' || COALESCE((source -> 'fr')::text, '')) @@ plainto_tsquery(:input)
      OR
      to_tsvector('italian',  COALESCE((name -> 'it')::text, '')
      || ' ' || COALESCE((description -> 'it')::text, '')
      || ' ' || COALESCE((source -> 'it')::text, '')) @@ plainto_tsquery(:input)
      )
      `,
          {
            input
          }
        )
      )
      .orderByRaw("name -> 'en'")
    return query
  },

  getGroupLayers(group_id: string, includeMapInfo = false): Promise<Layer[]> {
    const query = includeMapInfo
      ? knex
          .select(
            'layer_id',
            'shortid',
            'name',
            'description',
            'data_type',
            'remote',
            'remote_host',
            'remote_layer_id',
            'status',
            'source',
            'license',
            'presets',
            'allow_public_submit',
            'is_external',
            'external_layer_type',
            'external_layer_config',
            'disable_export',
            'owned_by_group_id',
            knex.raw("timezone('UTC', last_updated) as last_updated"),
            'views',
            'style',
            'legend_html',
            'labels',
            'settings',
            'extent_bbox',
            'preview_position'
          )
          .table('omh.layers')
      : knex
          .select(
            'layer_id',
            'shortid',
            'name',
            'description',
            'data_type',
            'remote',
            'remote_host',
            'remote_layer_id',
            'status',
            'private',
            'source',
            'license',
            'presets',
            'allow_public_submit',
            'is_external',
            'external_layer_type',
            'external_layer_config',
            'owned_by_group_id',
            knex.raw("timezone('UTC', last_updated) as last_updated"),
            'views'
          )
          .table('omh.layers')
          .orderByRaw("name -> 'en'")

    query.where({
      status: 'published',
      owned_by_group_id: group_id
    })
    return query
  },

  getUserLayers(user_id: number, number: number): Promise<Layer[]> {
    const subquery = knex
      .select()
      .distinct('group_id')
      .from('omh.group_memberships')
      .where({
        user_id
      })
    const query = knex
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'private',
        'source',
        'license',
        'presets',
        'style',
        'legend_html',
        'labels',
        'settings',
        'extent_bbox',
        'preview_position',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'allow_public_submit',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated"),
        'views'
      )
      .table('omh.layers')
      .whereIn('owned_by_group_id', subquery)
      .where({
        status: 'published'
      })
      .orderBy('last_updated', 'desc')
      .limit(number)

    return query
  },

  async getLayerByID(
    layer_id: number,
    trx?: Knex.Transaction
  ): Promise<Layer | null> {
    debug.log('getting layer: ' + layer_id)
    let db = knex

    if (trx) {
      db = trx
    }

    const result = await db
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'private',
        'source',
        'license',
        'presets',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'disable_export',
        'is_empty',
        'allow_public_submit',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated"),
        knex.raw("timezone('UTC', creation_time) as creation_time"),
        'views',
        'style',
        'labels',
        'settings',
        'legend_html',
        'extent_bbox',
        'preview_position',
        'updated_by_user_id',
        'created_by_user_id'
      )
      .table('omh.layers')
      .where('layer_id', layer_id)

    if (result && result.length === 1) {
      return result[0]
    }

    // else
    return null
  },

  async getLayerByShortID(
    shortid: string,
    trx?: Knex.Transaction
  ): Promise<Layer | null> {
    debug.log('getting layer shortid: ' + shortid)
    const db = trx || knex

    const result = await db
      .select(
        'layer_id',
        'shortid',
        'name',
        'description',
        'data_type',
        'remote',
        'remote_host',
        'remote_layer_id',
        'status',
        'private',
        'source',
        'license',
        'presets',
        'is_external',
        'external_layer_type',
        'external_layer_config',
        'disable_export',
        'is_empty',
        'allow_public_submit',
        'owned_by_group_id',
        knex.raw("timezone('UTC', last_updated) as last_updated"),
        knex.raw("timezone('UTC', creation_time) as creation_time"),
        'views',
        'style',
        'labels',
        'settings',
        'legend_html',
        'extent_bbox',
        'preview_position',
        'updated_by_user_id',
        'created_by_user_id'
      )
      .table('omh.layers')
      .whereRaw('trim(shortid) = trim(?)', [shortid])

    if (result && result.length === 1) {
      return result[0]
    }

    // else
    return null
  },

  async isSharedInPublicMap(shortid: string): Promise<boolean> {
    const result = await knex
      .count('omh.layers.layer_id')
      .from('omh.layers')
      .leftJoin(
        'omh.map_layers',
        'omh.layers.layer_id',
        'omh.map_layers.layer_id'
      )
      .leftJoin('omh.maps', 'omh.map_layers.map_id', 'omh.maps.map_id')
      .whereNotNull('omh.maps.share_id')
      .where('omh.layers.shortid', shortid)

    if (result[0] && result[0].count && result[0].count > 0) {
      return true
    }

    return false
  },

  async getLayerNotes(layer_id: number): Promise<{ notes: string } | null> {
    const result = await knex('omh.layer_notes').select('notes').where({
      layer_id
    })

    if (result && result.length === 1) {
      return result[0]
    }

    return null
  },

  async getGeoJSON(layer_id: number): Promise<any> {
    const layerTable = `layers.data_${layer_id}`
    const data = await knex.raw(
      'select mhid, ST_AsGeoJSON(ST_Force2D(wkb_geometry)) as geom, tags from :layerTable:',
      {
        layerTable
      }
    )
    const bbox = await knex.raw(
      "select '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox from (select ST_Extent(wkb_geometry) as bbox from :layerTable:) a",
      {
        layerTable
      }
    )
    return new Promise((resolve, reject) => {
      dbgeo.parse(
        data.rows,
        {
          outputFormat: 'geojson',
          geometryColumn: 'geom',
          geometryType: 'geojson'
        },
        (error, result) => {
          if (error) {
            log.error(error)
            reject(error)
            return
          }

          if (result.features) {
            // convert tags to properties
            for (const feature of result.features) {
              const tags = feature.properties.tags

              if (tags) {
                for (const key of Object.keys(tags)) {
                  const val = tags[key]
                  feature.properties[key] = val
                }
                delete feature.properties.tags
              }
            }
          }

          result.bbox = JSON.parse(bbox.rows[0].bbox)
          resolve(result)
        }
      )
    })
  },

  async getGeoJSONAgg(
    layer_id: number,
    aggFields: Array<string>
  ): Promise<{
    features: any
    type: string
  }> {
    const layerTable = `layers.data_full_${layer_id}`
    const layer = await this.getLayerByID(layer_id)
    const properties = aggFields.map((field) =>
      knex.raw(`'${field}', "${field}"`)
    )
    const groupBys = aggFields.map((field) => knex.raw(`"${field}"`))
    for (const preset of layer.presets) {
      if (!aggFields.includes(preset.tag)) {
        properties.push(
          knex.raw(`'${preset.tag}', string_agg(distinct "${preset.tag}", ',')`)
        )
      }
    }
    properties.push(knex.raw("'mhid', string_agg(distinct mhid, ',')"))
    const selects = [
      knex.raw("'Feature' as type"),
      knex.raw(`json_build_object(${properties.toString()}) as properties`),
      knex.raw(
        'ST_AsGeoJSON(ST_Multi(ST_Union(ST_Transform(geom, 4326)))):: json as geometry'
      )
    ]
    const features = await knex(layerTable).select(selects).groupBy(groupBys)
    // console.log(data)
    return {
      type: 'FeatureCollection',
      features
    }
  },

  // Layer Security
  async isPrivate(layer_id: number): Promise<boolean> {
    const result = await knex.select('private').from('omh.layers').where({
      layer_id
    })

    if (result && result.length === 1) {
      return result[0].private
    }

    return true // if we don't find the layer, assume it should be private
  },

  async attachPermissionsToLayers(
    layers: Layer[],
    user_id: number
  ): Promise<Layer[]> {
    return Promise.all(
      layers.map(async (layer) => {
        const allowed = await this.allowedToModify(layer.layer_id, user_id)
        layer.canEdit = allowed
        return layer
      })
    )
  },

  async allowedToModify(
    layer_id: number,
    user_id: number,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    if (!layer_id || !user_id) {
      return false
    }

    const layer = await this.getLayerByID(layer_id, trx)

    if (layer) {
      // if the layer has not yet been assigned to a group (still in progress in the wizard) then only the creating user can modify
      if (
        layer.status === 'incomplete' &&
        layer.created_by_user_id === user_id
      ) {
        return true
      }

      const users = await Group.getGroupMembers(layer.owned_by_group_id)

      if (
        _find(users, {
          id: user_id
        }) !== undefined
      ) {
        return true
      }

      return false
    } else {
      return false
    }
  },

  // Layer creation/modification
  async createLayer(user_id: number, trx: Knex.Transaction): Promise<number> {
    const layer_id_result: string = await trx('omh.layers')
      .insert({
        status: 'incomplete',
        created_by_user_id: user_id,
        creation_time: knex.raw('now()'),
        updated_by_user_id: user_id,
        extent_bbox: '[-175,-85,175,85]',
        // make sure we always init a default for this
        last_updated: knex.raw('now()')
      })
      .returning('layer_id')
    const layer_id = Number.parseInt(layer_id_result)
    await trx('omh.layers')
      .update({
        shortid: shortid.generate()
      })
      .where({
        layer_id
      })
    return layer_id
  },

  createRemoteLayer(
    group_id: string,
    layer: any,
    host: string,
    user_id: number
  ): any {
    layer.remote = true
    layer.remote_host = host
    layer.remote_layer_id = layer.layer_id
    delete layer.layer_id
    layer.owned_by_group_id = group_id
    layer.created_by_user_id = user_id
    layer.updated_by_user_id = user_id
    layer.last_updated = knex.raw('now()')
    // stringify objects before inserting
    layer.presets = JSON.stringify(layer.presets)
    layer.style = JSON.stringify(layer.style)
    layer.external_layer_config = JSON.stringify(layer.external_layer_config)
    layer.labels = JSON.stringify(layer.labels)
    layer.extent_bbox = JSON.stringify(layer.extent_bbox)
    layer.preview_position = JSON.stringify(layer.preview_position)

    // convert older external layers to new format
    // TODO: include explict version # with remote layers for API compatibility checking
    if (typeof layer.name === 'string') {
      layer.name = {
        en: layer.name,
        fr: '',
        es: '',
        it: ''
      }
    }

    if (typeof layer.description === 'string') {
      layer.description = {
        en: layer.description,
        fr: '',
        es: '',
        it: ''
      }
    }

    if (typeof layer.source === 'string') {
      layer.source = {
        en: layer.source,
        fr: '',
        es: '',
        it: ''
      }
    }

    return knex('omh.layers').returning('layer_id').insert(layer)
  },

  async updateRemoteLayer(
    layer_id: number,
    group_id: string,
    layer: any,
    host: string,
    user_id: number
  ): Promise<number> {
    layer.remote = true
    layer.remote_host = host
    layer.remote_layer_id = layer.layer_id
    delete layer.layer_id
    layer.owned_by_group_id = group_id
    layer.created_by_user_id = user_id
    layer.updated_by_user_id = user_id
    layer.last_updated = knex.raw('now()')
    // stringify objects before inserting
    layer.presets = JSON.stringify(layer.presets)
    layer.style = JSON.stringify(layer.style)
    layer.external_layer_config = JSON.stringify(layer.external_layer_config)
    layer.labels = JSON.stringify(layer.labels)
    layer.extent_bbox = JSON.stringify(layer.extent_bbox)
    layer.preview_position = JSON.stringify(layer.preview_position)

    if (typeof layer.name === 'string') {
      layer.name = {
        en: layer.name,
        fr: '',
        es: '',
        it: ''
      }
    }

    if (typeof layer.description === 'string') {
      layer.description = {
        en: layer.description,
        fr: '',
        es: '',
        it: ''
      }
    }

    if (typeof layer.source === 'string') {
      layer.source = {
        en: layer.source,
        fr: '',
        es: '',
        it: ''
      }
    }

    const result = await knex('omh.layers')
      .where({
        layer_id
      })
      .update(layer)
    await ScreenshotUtils.reloadLayerThumbnail(layer_id)
    await ScreenshotUtils.reloadLayerImage(layer_id)
    return result
  },

  /*
    Used by delete
    */
  async removeLayerFromMaps(
    layer_id: number,
    trx: Knex.Transaction
  ): Promise<boolean[]> {
    // get maps that use this layer
    const db = trx || knex
    // get a list of maps that contain the layer
    const maps = await db.select('map_id').from('omh.map_layers').where({
      layer_id
    })
    // remove layers from maps
    await db('omh.map_layers')
      .where({
        layer_id
      })
      .del()
    // rebuild map styles
    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    return Bluebird.map(maps, async (map) => {
      const map_id = map.map_id
      debug.log('removing layer: ' + layer_id + ' from map: ' + map_id)
      // get the remaining map layers
      const layers = await Map.getMapLayers(map_id, db)
      const style = MapStyles.style.buildMapStyle(layers)
      // also clear screenshot & thumbnail images so they will be recreated
      return db('omh.maps')
        .where({
          map_id
        })
        .update({
          style,
          screenshot: null,
          thumbnail: null
        }) // TODO: initial rebuild of thumbnail
    })
  },

  async setComplete(layer_id: number, trx: Knex.Transaction): Promise<number> {
    const db = trx || knex
    return db('omh.layers')
      .update({
        status: 'published'
      })
      .where({
        layer_id
      })
  },

  async transferLayerToGroup(
    layer_id: number,
    group_id: string,
    user_id: number
  ): Promise<number> {
    return knex('omh.layers')
      .update({
        owned_by_group_id: group_id,
        updated_by_user_id: user_id,
        last_updated: knex.raw('now()')
      })
      .where({
        layer_id
      })
  },

  async delete(layer_id: number): Promise<boolean> {
    return knex.transaction(async (trx) => {
      const layer = await this.getLayerByID(layer_id, trx)

      if (!layer.remote && !layer.is_external) {
        await DataLoadUtils.removeLayerData(layer_id, trx)
      }

      await trx('omh.layer_views')
        .where({
          layer_id
        })
        .del()
      await this.removeLayerFromMaps(layer_id, trx)
      await trx('omh.layer_notes')
        .where({
          layer_id
        })
        .del()
      await PhotoAttachment.removeAllLayerAttachments(layer_id, trx)
      await trx('omh.layers')
        .where({
          layer_id
        })
        .del()
      // TODO: notify group owners that a layer has been removed
      // TODO: notify map owners that a layer has been removed
      return true
    })
  },

  async saveSettings(
    layer_id: number,
    name: string,
    description: string,
    group_id: string,
    isPrivate: boolean,
    source: any,
    license: any,
    user_id: number
  ): Promise<number> {
    return knex.transaction(async (trx) => {
      const layer = await this.getLayerByID(layer_id, trx)

      // don't change privacy if request is missing the value
      if (isPrivate === undefined) {
        isPrivate = layer.private
      }

      let owned_by_group_id = layer.owned_by_group_id

      if (!owned_by_group_id) {
        // set for the first time
        owned_by_group_id = group_id
      } else if (group_id !== layer.owned_by_group_id) {
        log.warn(
          'transfering layer ownership not implemented in this method: ' +
            layer_id
        )
      }

      const update = trx('omh.layers')
        .update({
          name,
          description,
          private: isPrivate,
          source,
          license,
          owned_by_group_id,
          updated_by_user_id: user_id,
          last_updated: knex.raw('now()')
        })
        .where({
          layer_id
        })

      if (!layer.private && isPrivate) {
        // public layer is switching to private
        log.info('Public layer switching to private: ' + layer_id)
        await this.removePrivateLayerFromMaps(layer_id, trx)
      }

      return update
    })
  },

  async saveAdminSettings(
    layer_id: number,
    group_id: string,
    disable_export: boolean,
    allow_public_submit: boolean,
    user_id: number
  ): Promise<number> {
    return knex.transaction(async (trx) => {
      const update = trx('omh.layers')
        .update({
          owned_by_group_id: group_id,
          disable_export,
          allow_public_submit,
          updated_by_user_id: user_id,
          last_updated: knex.raw('now()')
        })
        .where({
          layer_id
        })
      return update
    })
  },

  async saveExternalLayerConfig(
    layer_id: number,
    external_layer_config: Layer['external_layer_config'],
    user_id: number
  ): Promise<number> {
    return knex.transaction(async (trx) => {
      const update = trx('omh.layers')
        .update({
          external_layer_config,
          updated_by_user_id: user_id,
          last_updated: knex.raw('now()')
        })
        .where({
          layer_id
        })
      return update
    })
  },

  async setUpdated(
    layer_id: number,
    user_id: number,
    trx?: Knex.Transaction
  ): Promise<number> {
    let db = knex

    if (trx) {
      db = trx
    }

    return db('omh.layers')
      .update({
        updated_by_user_id: user_id,
        last_updated: db.raw('now()')
      })
      .where({
        layer_id
      })
  },

  saveDataSettings(
    layer_id: number,
    is_empty: boolean,
    empty_data_type: string,
    is_external: boolean,
    external_layer_type: string,
    external_layer_config: Layer['external_layer_config'],
    user_id: number
  ): Knex.QueryBuilder {
    return is_external
      ? knex('omh.layers')
          .where({
            layer_id
          })
          .update({
            is_external,
            external_layer_type,
            external_layer_config: JSON.stringify(external_layer_config),
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
          })
      : knex('omh.layers')
          .where({
            layer_id
          })
          .update({
            is_empty,
            data_type: empty_data_type,
            is_external,
            external_layer_type,
            external_layer_config: JSON.stringify(external_layer_config),
            updated_by_user_id: user_id,
            last_updated: knex.raw('now()')
          })
  },

  async saveStyle(
    layer_id: number,
    style: any,
    labels: any,
    legend_html: any,
    settings: any,
    preview_position: any,
    user_id: number
  ): Promise<boolean> {
    await knex('omh.layers')
      .where({
        layer_id
      })
      .update({
        style: JSON.stringify(style),
        labels: JSON.stringify(labels),
        settings: JSON.stringify(settings),
        legend_html,
        preview_position,
        updated_by_user_id: user_id,
        last_updated: knex.raw('now()')
      })
    // update the thumbnail
    await ScreenshotUtils.reloadLayerThumbnail(layer_id)
    return ScreenshotUtils.reloadLayerImage(layer_id)
  },

  async savePresets(
    layer_id: number,
    presets: any,
    style: any,
    user_id: number,
    create: boolean,
    trx?: Knex.Transaction
  ): Promise<number> {
    return Presets.savePresets(layer_id, presets, style, user_id, create, trx)
  },

  async saveLayerNote(
    layer_id: number,
    user_id: number,
    notes: string
  ): Promise<Knex.QueryBuilder> {
    const result = await knex('omh.layer_notes').select('layer_id').where({
      layer_id
    })

    return result && result.length === 1
      ? knex('omh.layer_notes')
          .update({
            notes,
            updated_by: user_id,
            updated_at: knex.raw('now()')
          })
          .where({
            layer_id
          })
      : knex('omh.layer_notes').insert({
          layer_id,
          notes,
          created_by: user_id,
          created_at: knex.raw('now()'),
          updated_by: user_id,
          updated_at: knex.raw('now()')
        })
  },

  async importLayer(
    layer: Record<string, any>,
    group_id: string,
    user_id: number,
    trx: Knex.Transaction
  ): Promise<number> {
    delete layer.layer_id // get a new id from this instance

    layer.owned_by_group_id = group_id
    layer.created_by_user_id = user_id
    layer.updated_by_user_id = user_id
    layer.last_updated = knex.raw('now()')
    const style = layer.style
    layer.description = JSON.stringify(layer.description)
    layer.settings = JSON.stringify(layer.settings)
    layer.extent_bbox = JSON.stringify(layer.extent_bbox)
    layer.external_layer_config = JSON.stringify(layer.external_layer_config)
    layer.name = JSON.stringify(layer.name)
    layer.presets = JSON.stringify(layer.presets)
    layer.preview_position = JSON.stringify(layer.preview_position)
    layer.source = JSON.stringify(layer.source)
    layer.style = JSON.stringify(layer.style)
    // layers imported from Maps may have these
    delete layer.default_style
    delete layer.default_labels
    delete layer.default_legend_html
    delete layer.default_settings
    const result = await trx('omh.layers').insert(layer).returning('layer_id')
    let layer_id

    if (result && result.length > 0) {
      layer_id = result[0]
    } else {
      throw new Error('layer insert failed')
    }

    let styleUpdated = false
    for (const layer of style.layers) {
      if (layer.metadata && layer.metadata['maphubs:layer_id']) {
        layer.metadata['maphubs:layer_id'] = layer_id
        styleUpdated = true
      }
    }

    if (styleUpdated) {
      await trx('omh.layers')
        .update({
          style: JSON.stringify(style)
        })
        .where({
          layer_id
        })
    }

    return layer_id
  }
}
