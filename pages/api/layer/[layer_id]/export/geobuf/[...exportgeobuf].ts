import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../../src/auth/check-user'
import exportUtils from '../../../../../../src/services/export-utils'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const layer_id = Number.parseInt(req.query.layer_id as string)

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
  return exportUtils.completeGeoBufExport(req, res, layer_id)
}
export default handler
