import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import {
  apiError,
  notAllowedError,
  apiDataError
} from '../../../../src/services/error-response'
import LayerModel from '../../../../src/models/layer'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import LayerData from '../../../../src/models/layer-data'
import knex from '../../../../src/connection'

const debug = DebugService('layer submit public data')

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
    const data = req.body

    if (data && data.layer_id && data.feature) {
      const layer = await LayerModel.getLayerByID(data.layer_id)

      return layer.allow_public_submit
        ? knex.transaction(async (trx) => {
            await LayerData.createFeature(data.layer_id, data.feature, trx)
            await LayerModel.setUpdated(data.layer_id, user_id, trx)
            debug.log('feature submission complete')
            return res.status(200).json({
              success: true
            })
          })
        : notAllowedError(res, 'layer')
    } else {
      apiDataError(res)
    }
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
