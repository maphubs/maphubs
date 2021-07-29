import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import { apiDataError, apiError } from '../../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const saveLayerNotes: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)
  const data = req.body
  if (data && data.layer_id && data.notes) {
    try {
      if (await LayerModel.allowedToModify(data.layer_id, user_id)) {
        await LayerModel.saveLayerNote(data.layer_id, user_id, data.notes)
        return res.status(200).json({
          success: true
        })
      } else {
        res.status(401).send('unauthorized')
      }
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default saveLayerNotes
