import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import LayerModel from '../../../../src/models/layer'
import { apiDataError, apiError } from '../../../../src/services/error-response'
import { isMember } from '../../../../src/auth/check-user'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const saveStyle: NextApiHandler = async (req, res) => {
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
        const result = await LayerModel.saveStyle(
          data.layer_id,
          data.style,
          data.labels,
          data.legend_html,
          data.settings,
          data.preview_position,
          user_id
        )
        if (result) {
          res.status(200).json({
            success: true,
            action: 'saveStyle'
          })
        } else {
          res.status(200).json({
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
export default saveStyle
