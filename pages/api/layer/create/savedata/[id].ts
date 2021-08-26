import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../src/auth/check-user'
import {
  apiError,
  notAllowedError
} from '../../../../../src/services/error-response'
import LayerModel from '../../../../../src/models/layer'
import knex from '../../../../../src/connection'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = DebugService('layer set data complete')

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }

  if (
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true' &&
    (!user?.sub || !isMember(user))
  ) {
    return res.status(401).json({
      error: 'Login required'
    })
  }
  const user_id = Number.parseInt(user.sub)

  try {
    const layer_id = Number.parseInt(req.query.id as string)

    if (await LayerModel.allowedToModify(layer_id, user_id)) {
      await knex.transaction(async (trx) => {
        const layer = await LayerModel.getLayerByID(layer_id, trx)

        if (layer) {
          await trx('omh.layers')
            .update({
              status: 'loaded'
            })
            .where({
              layer_id
            })
          debug.log('data load transaction complete')
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
      notAllowedError(res, 'layer')
    }
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
