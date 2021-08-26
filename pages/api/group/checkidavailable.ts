import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../src/auth/check-user'
import GroupModel from '../../../src/models/group'
import { apiError, apiDataError } from '../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const group_id = req.query.group_id as string

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
  try {
    if (req.body && req.body.id) {
      return res.status(200).json({
        available: await GroupModel.checkGroupIdAvailable(req.body.id)
      })
    } else {
      apiDataError(res)
    }
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
