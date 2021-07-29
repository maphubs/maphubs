import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import FeatureModel from '../../../../src/models/feature'

import {
  apiError,
  notAllowedError,
  apiDataError
} from '../../../../src/services/error-response'
import knex from '../../../../src/connection'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const featureSaveNotes: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)

  const data = req.body
  if (data && data.layer_id && data.mhid && data.notes) {
    try {
      return (await LayerModel.allowedToModify(data.layer_id, user_id))
        ? knex.transaction(async (trx) => {
            await FeatureModel.saveFeatureNote(
              data.mhid,
              data.layer_id,
              user_id,
              data.notes,
              trx
            )
            return res.status(200).json({
              success: true
            })
          })
        : notAllowedError(res, 'layer')
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default featureSaveNotes
