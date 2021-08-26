import MapStyles from '../components/Maps/Map/Styles'
import knex from '../connection'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import { Knex } from 'knex'

export default {
  savePresets(
    layer_id: number,
    presets: any,
    style: Record<string, any>,
    user_id: number,
    create: boolean,
    trx?: Knex.Transaction
  ): Promise<number> {
    let db = knex

    if (trx) {
      db = trx
    }

    if (create) {
      // just insert them
      return db('omh.layers')
        .where({
          layer_id
        })
        .update({
          presets: JSON.stringify(presets),
          style,
          updated_by_user_id: user_id,
          last_updated: knex.raw('now()')
        })
    } else {
      // look for modified tags(properties) since new need to rename them in the data
      const updateCommands = []
      for (const preset of presets) {
        if (preset.prevTag !== undefined) {
          // preset was modified
          updateCommands.push(
            db(`layers.data_${layer_id}`)
              .select(db.raw(`count(tags -> '${preset.prevTag}')`))
              .then((countResult) => {
                if (countResult[0].count === 0) {
                  return db.raw(
                    `UPDATE layers.data_${layer_id} SET tags=jsonb_set(tags, '{${preset.tag}}', tags-> '${preset.prevTag}')`
                  )
                } else {
                  log.error(`tag: ${preset.prevTag} already exists`)
                }
              })
          )
        }
      }

      return updateCommands.length > 0
        ? Promise.all(updateCommands).then(() => {
            return db('omh.layers')
              .where({
                layer_id
              })
              .update({
                presets: JSON.stringify(presets),
                style,
                updated_by_user_id: user_id,
                last_updated: knex.raw('now()')
              })
          })
        : db('omh.layers')
            .where({
              layer_id
            })
            .update({
              presets: JSON.stringify(presets),
              style,
              updated_by_user_id: user_id,
              last_updated: knex.raw('now()')
            })
    }
  },

  // Not needed?
  updatePresetsInMapStyles(layer_id: number, presets: any): any {
    return knex
      .raw(
        `
        select omh.map_layers.map_id, omh.map_layers .layer_id, 
omh.map_layers.style as map_layer_style,
omh.layers.style as orig_layer_style
from omh.map_layers 
left join omh.layers on omh.map_layers.layer_id = omh.layers.layer_id
where map_id in (SELECT distinct map_id from omh.map_layers where layer_id = :layer_id)
order by position
      `,
        {
          layer_id
        }
      )
      .then((result) => {
        const updatedMapStyles = {}
        const updateCommands = []
        for (const mapLayer of result.rows) {
          const mapLayerStyle = mapLayer.map_layer_style
          // update source metadata
          for (const sourceID of Object.keys(mapLayerStyle.sources)) {
            const mapSource = mapLayerStyle.sources[sourceID]

            if (!mapSource.metadata) {
              mapSource.metadata = {}
            }

            mapSource.metadata['maphubs:presets'] = presets
          }

          if (!updatedMapStyles[mapLayer.map_id]) {
            updatedMapStyles[mapLayer.map_id] = []
          }

          updatedMapStyles[mapLayer.map_id].push({
            layer_id: mapLayer.layer_id,
            style: mapLayerStyle
          })
          updateCommands.push(
            knex('omh.map_layers')
              .update({
                style: mapLayerStyle
              })
              .where({
                map_id: mapLayer.map_id,
                layer_id: mapLayer.layer_id
              })
          )
        }
        // loop through map_ids, build updated styles, and update
        for (const map_id of Object.keys(updatedMapStyles)) {
          const updatedMapStyle = MapStyles.style.buildMapStyle(
            updatedMapStyles[map_id]
          )
          updateCommands.push(
            knex('omh.maps')
              .update({
                style: updatedMapStyle
              })
              .where({
                map_id
              })
          )
        }
        return Promise.all(updateCommands)
      })
  }
}
