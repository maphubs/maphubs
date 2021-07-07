// var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('routes/stories');
import login from 'connect-ensure-login'
import Story from '../../models/story'
import Stats from '../../models/stats'
import Map from '../../models/map'
import Group from '../../models/group'
import { nextError } from '../../services/error-response'
import csurf from 'csurf'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any): void {
  // Views
  app.get('/stories', async (req, res, next) => {
    try {
      return app.next.render(
        req,
        res,
        '/stories',
        await pageOptions(req, {
          title: req.__('Stories') + ' - ' + local.productName,
          props: {
            popularStories: await Story.getPopularStories(10),
            recentStories: await Story.getRecentStories({
              number: 10
            })
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/stories/all', async (req, res, next) => {
    try {
      return app.next.render(
        req,
        res,
        '/allstories',
        await pageOptions(req, {
          title: req.__('Stories') + ' - ' + local.productName,
          props: {
            stories: await Story.getAllStories().orderBy('omh.stories.title')
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/createstory',
    login.ensureLoggedIn(),
    csrfProtection,
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id
        const story_id = await Story.createStory(user_id)
        log.info(`created new story: ${story_id}`)
        return res.redirect(`/editstory/${story_id}/New Story`)
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.get(
    '/editstory/:story_id/*',
    login.ensureLoggedIn(),
    csrfProtection,
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id
        const story_id = Number.parseInt(req.params.story_id || '', 10)
        const locale = req.session.locale || 'en'
        const story = await Story.getStoryById(story_id)
        let firstEdit
        console.log(story)

        if (!story.owned_by_group_id && story.updated_by === user_id) {
          firstEdit = true
          log.info(`first edit for story: ${story_id}`)
        }

        if (firstEdit || (await Story.allowedToModify(story_id, user_id))) {
          const title = story.title ? story.title[locale] : 'New Story'
          return app.next.render(
            req,
            res,
            '/editstory',
            await pageOptions(req, {
              title: 'Editing: ' + title,
              props: {
                story,
                myMaps: await Map.getUserMaps(user_id),
                popularMaps: await Map.getPopularMaps(),
                groups: await Group.getGroupsForUser(user_id)
              }
            })
          )
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.get('/story/:title/:story_id', (req, res, next) => {
    const story_id = Number.parseInt(req.params.story_id || '', 10)
    const username = req.params.username
    const locale = req.session.locale || 'en'
    let user_id = -1

    if (
      (req.isAuthenticated || req.isAuthenticated()) &&
      req.session &&
      req.session.user
    ) {
      user_id = req.session.user.maphubsUser.id
    }

    Story.getStoryById(story_id)
      .then(async (story) => {
        if (!story) {
          return res.redirect('/notfound?path=' + req.path)
        }

        if (!req.session.storyviews) {
          req.session.storyviews = {}
        }

        if (!req.session.storyviews[story_id]) {
          req.session.storyviews[story_id] = 1
          Stats.addStoryView(story_id, user_id).catch(nextError(next))
        } else {
          const views = req.session.storyviews[story_id]
          req.session.storyviews[story_id] = views + 1
        }

        req.session.views = (req.session.views || 0) + 1

        if (user_id === -1) {
          // don't check permissions if user is not logged in
          let imageUrl = ''

          if (story.firstimage) {
            imageUrl = urlUtil.getBaseUrl() + story.firstimage
          }

          let description = story.title[locale]

          if (story.summary) {
            description = story.summary[locale]
          }

          return !story.published
            ? res.status(401).send('Unauthorized')
            : app.next.render(
                req,
                res,
                '/story',
                await pageOptions(req, {
                  title: story.title[locale],
                  description,
                  props: {
                    story,
                    username,
                    canEdit: false
                  },
                  talkComments: true,
                  twitterCard: {
                    title: story.title[locale],
                    description,
                    image: imageUrl,
                    imageType: 'image/jpeg'
                  }
                })
              )
        } else {
          return Story.allowedToModify(story_id, user_id).then(
            async (canEdit) => {
              let imageUrl = ''

              if (story.firstimage) {
                imageUrl = story.firstimage
              }

              let description = story.title[locale]

              if (story.summary) {
                description = story.summary[locale]
              }

              return !story.published && !canEdit
                ? res.status(401).send('Unauthorized')
                : app.next.render(
                    req,
                    res,
                    '/story',
                    await pageOptions(req, {
                      title: story.title[locale],
                      description,
                      props: {
                        story,
                        username,
                        canEdit
                      },
                      talkComments: true,
                      twitterCard: {
                        title: story.title[locale],
                        description,
                        image: imageUrl,
                        imageType: 'image/jpeg'
                      }
                    })
                  )
            }
          )
        }
      })
      .catch(nextError(next))
  })
}
