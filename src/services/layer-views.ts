import knex from '../connection'

import Bluebird from 'bluebird'

import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import { Knex } from 'knex'

const debug = DebugService('layer-views')

export default {
  async replaceViews(
    layer_id: number,
    presets: any,
    trx: Knex.Transaction
  ): Promise<boolean> {
    debug.log('replace views for layer: ' + layer_id)

    try {
      await this.dropLayerViews(layer_id, trx)
      return this.createLayerViews(layer_id, presets, trx)
    } catch (err) {
      log.error(err.message)
      throw err
    }
  },

  async dropLayerViews(layer_id: number, trx?: Knex.Transaction) {
    debug.log('drop views for layer: ' + layer_id)
    const db = trx || knex

    const commands = [
      `DROP VIEW IF EXISTS layers.centroids_${layer_id}`,
      `DROP VIEW IF EXISTS layers.data_full_${layer_id}`
    ]
    return Bluebird.each(commands, (command) => {
      return db.raw(command).catch((err) => {
        log.error(err.message) // don't propagate errors in case we are recovering from a incomplete layer
      })
    }).catch((err) => {
      log.error(err.message)
      throw err
    })
  },

  async createLayerViews(
    layer_id: number,
    presets,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    const db = trx || knex

    return db('omh.layers')
      .select('data_type')
      .where({
        layer_id
      })
      .then((result) => {
        const dataType = result[0].data_type
        debug.log(`create views for layer: ${layer_id}`)
        let tagColumns = ''

        if (presets) {
          debug.log(presets)
          for (const preset of presets) {
            tagColumns +=
              preset.type === 'number'
                ? `CASE WHEN isnumeric(tags->>'${preset.tag}') THEN (tags->>'${preset.tag}')::double precision ELSE NULL END as "${preset.tag}",`
                : `(tags->>'${preset.tag}')::text as "${preset.tag}",`
          }
        } else {
          log.error(`Missing presets when creating view for layer ${layer_id}`)
        }

        const commands = [
          `CREATE OR REPLACE VIEW layers.data_full_${layer_id} AS
        SELECT
        mhid, ${layer_id}::integer as layer_id, ST_Force2D(ST_Transform(wkb_geometry, 900913))::geometry(Geometry, 900913) as geom,` +
            tagColumns +
            ` tags FROM layers.data_${layer_id}
        ;`
        ]

        if (dataType === 'polygon') {
          commands.push(`CREATE OR REPLACE VIEW layers.centroids_${layer_id} AS
        SELECT
        st_centroid(geom)::geometry(Point,900913) as centroid, * 
        FROM layers.data_full_${layer_id};`)
        }

        return Bluebird.each(commands, (command) => {
          return db.raw(command)
        }).catch((err) => {
          log.error(err.message)
          throw err
        })
      })
  }
}
