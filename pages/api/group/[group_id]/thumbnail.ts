import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import ImageModel from '../../../../src/models/image'
import { apiError } from '../../../../src/services/error-response'
import imageUtils from '../../../../src/services/image-utils'

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
    const result = await ImageModel.getGroupThumbnail(group_id)

    return result && result.thumbnail
      ? imageUtils.processImage(result.thumbnail, req, res)
      : res.status(404).send('')
  } catch (err) {
    apiError(res, 404)(err)
  }
}
export default handler
