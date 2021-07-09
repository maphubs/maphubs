import knex from '../connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Feature, FeatureCollection } from 'geojson'
import { Knex } from 'knex'
const debug = DebugService('feature')

export default {
  async getFeatureNotes(
    mhid: string,
    layerId: number,
    trx?: Knex.Transaction
  ): Promise<any> {
    const db = trx || knex
    const result = await db('omh.feature_notes').select('notes').where({
      mhid,
      layer_id: layerId
    })

    if (result && result.length === 1) {
      return result[0].notes
    }

    return null
  },

  async saveFeatureNote(
    mhid: string,
    layerId: number,
    userId: number,
    notes: string,
    trx?: Knex.Transaction
  ): Promise<any> {
    const db = trx || knex
    const result = await db('omh.feature_notes').select('mhid').where({
      mhid,
      layer_id: layerId
    })

    return result && result.length === 1
      ? db('omh.feature_notes')
          .update({
            notes,
            updated_by: userId,
            updated_at: db.raw('now()')
          })
          .where({
            mhid,
            layer_id: layerId
          })
      : db('omh.feature_notes').insert({
          layer_id: layerId,
          mhid,
          notes,
          created_by: userId,
          created_at: db.raw('now()'),
          updated_by: userId,
          updated_at: db.raw('now()')
        })
  },

  /**
   * Get GeoJSON for feature(s)
   *
   * @param {string} mhid
   * @param {number} layer_id
   * @returns
   */
  async getGeoJSON(
    mhid: string,
    layerId: number,
    trx?: Knex.Transaction
  ): Promise<FeatureCollection> {
    const db = trx || knex
    const layerTable = 'layers.data_' + layerId
    const data = await db
      .select(db.raw('ST_AsGeoJSON(ST_Force2D(wkb_geometry)) as geom'), 'tags')
      .from(layerTable)
      .where({
        mhid
      })

    if (!data || data.length === 0) {
      debug.error(`missing data: ${data}`)
      throw new Error(`Data not found for mhid: ${mhid}`)
    } else {
      const bbox = await db.raw(`select 
        '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox 
        from (select ST_Extent(wkb_geometry) as bbox from ${layerTable} where mhid='${mhid}') a`)
      const feature: Feature = {
        type: 'Feature',
        geometry: JSON.parse(data[0].geom),
        properties: data[0].tags
      }
      feature.properties.mhid = mhid
      return {
        type: 'FeatureCollection',
        features: [feature],
        bbox: JSON.parse(bbox.rows[0].bbox)
      }
    }
  }
}
