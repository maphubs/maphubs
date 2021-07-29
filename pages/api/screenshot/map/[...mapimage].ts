import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import { apiError } from '../../../../src/services/error-response'
import ScreenshotUtils from '../../../../src/services/screenshot-utils'

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

  try {
    const fileName = req.query.layerthumb[0] as string
    const fileParts = fileName.split('.')
    const map_id = Number.parseInt(fileParts[0])
    const image = await ScreenshotUtils.getMapImage(map_id)

    return ScreenshotUtils.returnImage(image, 'image/png', req, res)
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
