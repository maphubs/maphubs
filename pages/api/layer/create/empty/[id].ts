import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../../src/models/layer'
import {
  apiError,
  notAllowedError
} from '../../../../../src/services/error-response'
import layerViews from '../../../../../src/services/layer-views'
import knex from '../../../../../src/connection'
import DataLoadUtils from '../../../../../src/services/data-load-utils'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { isMember } from '../../../../../src/auth/check-user'

const debug = DebugService('createEmptyLayer')

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const createEmpty: NextApiHandler = async (req, res) => {
  const { id } = req.query
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  if (!user?.sub || !isMember(user)) {
    return res.status(401).json({
      error: 'Login required'
    })
  }
  const user_id = Number.parseInt(user.sub)

  try {
    const layer_id = Number.parseInt(id as string)

    if (await LayerModel.allowedToModify(layer_id, user_id)) {
      await knex.transaction(async (trx) => {
        const layer = await LayerModel.getLayerByID(layer_id, trx)

        if (layer) {
          await DataLoadUtils.createEmptyDataTable(layer.layer_id, trx)
          await layerViews.createLayerViews(layer_id, layer.presets, trx)
          debug.log('init empty transaction complete')
          return res.status(200).json({
            success: true
          })
        } else {
          return res.status(200).json({
            success: false,
            error: 'layer not found'
          })
        }
      })
    } else {
      return notAllowedError(res, 'layer')
    }
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default createEmpty
