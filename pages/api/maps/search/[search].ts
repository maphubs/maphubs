import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import { apiError } from '../../../../src/services/error-response'
import MapModel from '../../../../src/models/map'

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
  if (!req.query.q) {
    res.status(400).send('Bad Request: Expected query param. Ex. q=abc')
    return
  }

  try {
    const result = await MapModel.getSearchResults(req.query.q as string)

    return res.status(200).json({
      maps: result
    })
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
