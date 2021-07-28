import User from '../../models/user'
import Admin from '../../models/admin'
import Group from '../../models/group'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import { apiError, nextError } from '../../services/error-response'
import Auth0Helper from '../../services/auth0-helper'
import local from '../../local'
import pageOptions from '../../services/page-options-helper'

export default function (app: any): void {
  // can be used to dynamically check for login status, so should be public
  app.all('/api/user/details/json', async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(200).send({
        user: null
      })
    } else {
      try {
        const user_id = req.session.user.maphubsUser.id
        const user = await User.getUser(user_id)

        // add session content
        if (req.session.user && req.session.user._json) {
          user.username = req.session.user._json.username
          user.picture = req.session.user._json.picture
        }

        const groups = await Group.getGroupsForUser(user_id)
        user.groups = groups
        const admin = await Admin.checkAdmin(user_id)
        user.admin = admin
        return res.status(200).send({
          user
        })
      } catch (err) {
        apiError(res, 200)(err)
      }
    }
  })
}
