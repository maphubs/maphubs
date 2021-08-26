import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'
import { apiError } from '../../../../src/services/error-response'
import GroupModel from '../../../../src/models/group'
import Locales from '../../../../src/services/locales'

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
    const locale = (req.query.locale as string) || 'en'
    const result = await GroupModel.getSearchSuggestions(req.query.q as string)
    const suggestions = result.map((group) => {
      return {
        key: group.group_id,
        value: Locales.getLocaleStringObject(locale, group.name)
      }
    })
    res.status(200).json({
      suggestions
    })
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default handler
