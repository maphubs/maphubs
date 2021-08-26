import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../src/auth/check-user'
import {
  apiError,
  notAllowedError,
  apiDataError
} from '../../../src/services/error-response'
import LayerModel from '../../../src/models/layer'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import LayerData from '../../../src/models/layer-data'
import knex from '../../../src/connection'
import Bluebird from 'bluebird'

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

    if (data && data.layer_id && data.edits) {
      return (await LayerModel.allowedToModify(data.layer_id, user_id))
        ? knex.transaction(async (trx) => {
            // eslint-disable-next-line unicorn/no-array-method-this-argument
            await Bluebird.map(data.edits, (edit) => {
              switch (edit.status) {
                case 'create': {
                  return LayerData.createFeature(
                    data.layer_id,
                    edit.geojson,
                    trx
                  )
                }
                case 'modify': {
                  return LayerData.updateFeature(
                    data.layer_id,
                    edit.geojson.id,
                    edit.geojson,
                    trx
                  )
                }
                case 'delete': {
                  return LayerData.deleteFeature(
                    data.layer_id,
                    edit.geojson.id,
                    trx
                  )
                }
                // No default
              }
            })
            await LayerModel.setUpdated(data.layer_id, user_id, trx)
            debug.log('save edits complete')
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
