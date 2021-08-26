import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import StoryModel from '../../../src/models/story'
import ImageModel from '../../../src/models/image'
import {
  apiError,
  notAllowedError,
  apiDataError
} from '../../../src/services/error-response'
import knex from '../../../src/connection'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const deleteStory: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)

  try {
    const data = req.body

    if (data && data.story_id) {
      return (await StoryModel.allowedToModify(data.story_id, user_id))
        ? knex.transaction(async (trx) => {
            await ImageModel.removeAllStoryImages(data.story_id, trx)
            await StoryModel.delete(data.story_id, trx)
            // TODO: delete assets folder from S3
            return res.status(200).json({
              success: true
            })
          })
        : notAllowedError(res, 'story')
    } else {
      apiDataError(res)
    }
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default deleteStory
