import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import StoryModel from '../../../src/models/story'
import GroupModel from '../../../src/models/group'
import {
  apiError,
  notAllowedError,
  apiDataError
} from '../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const saveStory: NextApiHandler = async (req, res) => {
  const data = req.body
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }
  const user_id = Number.parseInt(user.sub)

  if (
    data &&
    data.owned_by_group_id &&
    data.title &&
    data.body &&
    data.published_at
  ) {
    const story_id = data.story_id

    try {
      let allowedToModify
      const story = await StoryModel.getStoryById(story_id)

      if (story) {
        if (story.owned_by_group_id) {
          if (story.owned_by_group_id !== data.owned_by_group_id) {
            // this is mainly an integrity check
            return notAllowedError(res, 'story')
          }

          // not possible to change group as a regular user
          delete data.owned_by_group_id
          allowedToModify = StoryModel.allowedToModify(story_id, user_id)
        } else {
          // use the provided group
          allowedToModify = await GroupModel.allowedToModify(
            data.owned_by_group_id,
            user_id
          )
        }
      } else {
        return res.status(404).send({
          error: 'not found'
        })
      }

      if (allowedToModify) {
        data.updated_by = user_id
        log.info(`updating story ${story_id}`)
        const result = await StoryModel.updateStory(story_id, data)

        return result
          ? res.status(200).json({
              success: true,
              story_id
            })
          : res.status(200).json({
              success: false,
              error: 'Failed to Save Story',
              story_id
            })
      } else {
        return notAllowedError(res, 'story')
      }
    } catch (err) {
      apiError(res, 500)(err)
    }
  } else {
    apiDataError(res)
  }
}
export default saveStory
