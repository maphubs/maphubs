import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import StoryModel from '../../../src/models/story'
import { apiError } from '../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const createStory: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)

  try {
    const story_id = await StoryModel.createStory(user_id)
    log.info(`created new story: ${story_id}`)
    res.redirect(`/editstory/${story_id}/New Story`)
  } catch (err) {
    apiError(res, 500)(err)
  }
}
export default createStory
