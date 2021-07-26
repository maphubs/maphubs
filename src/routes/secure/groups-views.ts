import Locales from '../../services/locales'
import Group from '../../models/group'
import User from '../../models/user'
import Layer from '../../models/layer'
import Map from '../../models/map'
import Story from '../../models/story'
import Account from '../../models/account'
import login from 'connect-ensure-login'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { nextError } from '../../services/error-response'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'
import csurf from 'csurf'

const csrfProtection = csurf({
  cookie: false
})

const debug = DebugService('routes/groups')

export default function (app: any): void {
  app.get('/group/:id', csrfProtection, async (req, res, next) => {
    try {
      const group_id = req.params.id
      let user_id = -1

      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      const group = await Group.getGroupByID(group_id)

      if (!group) {
        return res.redirect('/notfound?path=' + req.path)
      }

      const canEdit = await Group.allowedToModify(group_id, user_id)
      const image = `${urlUtil.getBaseUrl()}/group/${group_id}/image.png`
      const name = Locales.getLocaleStringObject(req.locale, group.name)
      const description = Locales.getLocaleStringObject(
        req.locale,
        group.description
      )
      return app.next.render(
        req,
        res,
        '/groupinfo',
        await pageOptions(req, {
          title: `${name} - ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`,
          description,
          props: {
            group,
            maps: await Map.getGroupMaps(group_id, canEdit),
            layers: await Layer.getGroupLayers(group_id, canEdit),
            stories: await Story.getGroupStories(group_id, canEdit),
            members: await Group.getGroupMembers(group_id),
            canEdit
          },
          twitterCard: {
            card: 'summary',
            title: name,
            description,
            image,
            imageType: 'image/png',
            imageWidth: 600,
            imageHeight: 600
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/group/:id/admin',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = Number.parseInt(req.session.user.maphubsUser.id)
        const group_id = req.params.id
        // confirm that this user is allowed to administer this group
        const role = await Group.getGroupRole(user_id, group_id)

        if (role === 'Administrator') {
          const group = await Group.getGroupByID(group_id)

          if (group) {
            const name = Locales.getLocaleStringObject(req.locale, group.name)
            return app.next.render(
              req,
              res,
              '/groupadmin',
              await pageOptions(req, {
                title:
                  name +
                  ' ' +
                  req.__('Settings') +
                  ' - ' +
                  process.env.NEXT_PUBLIC_PRODUCT_NAME,
                props: {
                  group,
                  maps: await Map.getGroupMaps(group_id, true),
                  layers: await Layer.getGroupLayers(group_id, true),
                  members: await Group.getGroupMembers(group_id),
                  account: await Account.getStatus(group_id)
                }
              })
            )
          } else {
            return res.redirect('/notfound')
          }
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
}
