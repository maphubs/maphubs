import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import {
  apiDataError,
  apiError,
  notAllowedError
} from '../../../../src/services/error-response'
import layerViews from '../../../../src/services/layer-views'
import knex from '../../../../src/connection'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const saveLayerPresets: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)
  const data = req.body

  if (
    data &&
    data.layer_id &&
    data.presets &&
    data.style &&
    data.create !== undefined
  ) {
    knex
      .transaction(async (trx) => {
        if (await LayerModel.allowedToModify(data.layer_id, user_id, trx)) {
          await LayerModel.savePresets(
            data.layer_id,
            data.presets,
            data.style,
            user_id,
            data.create,
            trx
          )

          if (data.create) {
            return res.status(200).json({
              success: true
            })
          } else {
            // update layer views and timestamp
            const layer = await LayerModel.getLayerByID(data.layer_id, trx)

            if (layer) {
              if (!layer.is_external) {
                await layerViews.replaceViews(data.layer_id, layer.presets, trx)
                // Mark layer as updated (tells vector tile service to reload)
                await trx('omh.layers')
                  .update({
                    updated_by_user_id: user_id,
                    last_updated: knex.raw('now()')
                  })
                  .where({
                    layer_id: data.layer_id
                  })
                return res.status(200).json({
                  success: true
                })
              } else {
                // Mark layer as updated
                await trx('omh.layers')
                  .update({
                    updated_by_user_id: user_id,
                    last_updated: knex.raw('now()')
                  })
                  .where({
                    layer_id: data.layer_id
                  })
                return res.status(200).json({
                  success: true
                })
              }
            } else {
              return res.status(200).json({
                success: false,
                error: 'layer not found'
              })
            }
          }
        } else {
          return notAllowedError(res, 'layer')
        }
      })
      .catch(apiError(res, 500))
  } else {
    apiDataError(res)
  }
}
export default saveLayerPresets
