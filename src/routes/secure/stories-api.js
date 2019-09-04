// @flow
const knex = require('../../connection')
// const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('routes/stories');
const Story = require('../../models/story')
const Group = require('../../models/group')
const Image = require('../../models/image')
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const csrfProtection = require('csurf')({cookie: false})
const isAuthenticated = require('../../services/auth-check')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = function (app: any) {
  app.post('/api/story/save', csrfProtection, isAuthenticated, async (req, res) => {
    const data = req.body
    if (data && data.owned_by_group_id && data.title && data.body) {
      const story_id = data.story_id
      try {
        let firstEdit
        let allowedToModify
        const story = await Story.getStoryById(story_id)
        if (story) {
          if (story.owned_by_group_id) {
            if (story.owned_by_group_id !== data.owned_by_group_id) {
              // this is mainly an integrity check
              return notAllowedError(res, 'story')
            }
            // not possible to change group as a regular user
            delete data.owned_by_group_id
            allowedToModify = Story.allowedToModify(story_id, req.user_id)
          } else {
            // user the provided group
            allowedToModify = await Group.allowedToModify(data.owned_by_group_id, req.user_id)
          }
        } else {
          return res.status(404).send({error: 'not found'})
        }
        if (!story.owned_by_group_id && story.updated_by === req.user_id) {
          firstEdit = true
          log.info(`first save for story: ${story_id}`)
          allowedToModifyGroup = await Group.allowedToModify(data.owned_by_group_id, req.user_id)
          if (!allowedToModifyGroup) {
            log.info(`not allowed to modify group: ${data.owned_by_group_id}`)
          }
        }
        if ((firstEdit && allowedToModifyGroup) || await Story.allowedToModify(story_id, req.user_id)) {
          data.updated_by = req.user_id
          const result = await Story.updateStory(story_id, data)
          if (result && result === 1) {
            return res.send({
              success: true,
              story_id
            })
          } else {
            return res.send({
              success: false,
              error: 'Failed to Save Story',
              story_id
            })
          }
        } else {
          return notAllowedError(res, 'story')
        }
      } catch (err) {
        apiError(res, 500)(err)
      }
    } else {
      apiDataError(res)
    }
  })

  app.post('/api/story/delete', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.story_id) {
        if (await Story.allowedToModify(data.story_id, req.user_id)) {
          return knex.transaction(async (trx) => {
            await Image.removeAllStoryImages(data.story_id, trx)
            await Story.delete(data.story_id, trx)
            // TODO: delete assets folder from S3
            return res.send({
              success: true
            })
          })
        } else {
          return notAllowedError(res, 'story')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/story/addimage', csrfProtection, isAuthenticated, (req, res) => {
    const data = req.body
    if (data && data.story_id && data.image) {
      Story.allowedToModify(data.story_id, req.user_id)
        .then((allowed) => {
          if (allowed) {
            return Image.addStoryImage(data.story_id, data.image, data.info)
              .then((image_id) => {
                return res.send({
                  success: true, image_id
                })
              }).catch(apiError(res, 500))
          } else {
            return notAllowedError(res, 'story')
          }
        }).catch(apiError(res, 500))
    } else {
      apiDataError(res)
    }
  })

  app.post('/api/story/removeimage', csrfProtection, isAuthenticated, (req, res) => {
    const data = req.body
    if (data && data.story_id && data.image_id) {
      Story.allowedToModify(data.story_id, req.user_id)
        .then(async (allowed) => {
          if (allowed) {
            await Image.removeStoryImage(data.story_id, data.image_id)
            return res.send({
              success: true
            })
          } else {
            return notAllowedError(res, 'story')
          }
        }).catch(apiError(res, 500))
    } else {
      apiDataError(res)
    }
  })
}
