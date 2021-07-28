import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import { apiDataError, apiError } from '../../../../src/services/error-response'
import { isMember } from '../../../../src/auth/check-user'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const saveAdminSettings: NextApiHandler = async (req, res) => {
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
  const data = req.body
  if (data && data.layer_id) {
    try {
      if (await LayerModel.allowedToModify(data.layer_id, user_id)) {
        const result = await LayerModel.saveAdminSettings(
          data.layer_id,
          data.group_id,
          data.disable_export,
          data.allow_public_submit,
          user_id
        )
        if (result) {
          res.status(200).send({
            success: true,
            action: 'saveAdminSettings'
          })
        } else {
          res.send({
            success: false,
            error: 'Failed to Update Layer'
          })
        }
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
export default saveAdminSettings
