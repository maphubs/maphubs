import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { apiDataError, apiError } from '../../../../src/services/error-response'
import { isAdmin } from '../../../../src/auth/check-user'
import UserModel from '../../../../src/models/user'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  try {
    const data = req.body

    if (data?.email) {
      if (isAdmin(user)) {
        res.status(200).send({
          success: true,
          key: await UserModel.setRole(data.email, 'disabled')
        })
      } else {
        return res.status(401).send('')
      }
    } else {
      apiDataError(res)
    }
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
