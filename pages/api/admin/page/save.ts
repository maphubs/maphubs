import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import AdminModel from '../../../../src/models/admin'
import PageModel from '../../../../src/models/page'
import { apiDataError, apiError } from '../../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)
  try {
    const data = req.body

    if (data && data.page_id && data.pageConfig) {
      if (await AdminModel.checkAdmin(user_id)) {
        const result = await PageModel.savePageConfig(
          data.page_id,
          data.pageConfig
        )

        return result
          ? res.status(200).json({
              success: true
            })
          : res.status(200).json({
              success: false,
              error: 'Failed to Save Page'
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
