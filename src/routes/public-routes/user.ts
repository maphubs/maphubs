import passport from 'passport'
import User from '../../models/user'
import Admin from '../../models/admin'
import Group from '../../models/group'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import { apiError, nextError } from '../../services/error-response'
import Auth0Helper from '../../services/auth0-helper'
import local from '../../local'
import csurf from 'csurf'
import pageOptions from '../../services/page-options-helper'
const csrfProtection = csurf({
  cookie: false
})

export default function (app: any): void {
  app.get('/signup/invite/:key', csrfProtection, async (req, res, next) => {
    try {
      const inviteKey = req.params.key

      if (inviteKey) {
        if (await Admin.checkInviteKey(inviteKey)) {
          const email = await Admin.useInvite(inviteKey)
          // check if auth0 already
          let existingAccount = false
          const accessToken = await Auth0Helper.getManagementToken()
          const auth0Accounts = await Auth0Helper.findUserByEmail(
            email,
            accessToken
          )

          if (
            auth0Accounts &&
            Array.isArray(auth0Accounts) &&
            auth0Accounts.length > 0
          ) {
            log.info(`Found User: ${JSON.stringify(auth0Accounts)}`)
            existingAccount = true
          }

          const middleware = passport.authenticate('auth0', {
            clientID: local.AUTH0_CLIENT_ID,
            domain: local.AUTH0_DOMAIN,
            redirectUri: local.AUTH0_CALLBACK_URL,
            audience: 'https://users.maphubs.com',
            responseType: 'code',
            scope: 'openid profile email',
            allowlogin: existingAccount ? 'true' : 'false',
            allowsignup: existingAccount ? 'false' : 'true',
            login_hint: email,
            screen_hint: !existingAccount ? 'signup' : undefined
          })
          return middleware(req, res, next)
        } else {
          return app.next.render(
            req,
            res,
            '/error',
            await pageOptions(req, {
              title: req.__('Invalid Key'),
              props: {
                title: req.__('Invite Key Invalid'),
                error: req.__(
                  'The key used was invalid or has already been used. Please contact an administrator.'
                ),
                url: req.url
              }
            })
          )
        }
      } else {
        return res.redirect('/login')
      }
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get(
    '/signup',
    passport.authenticate('auth0', {
      clientID: local.AUTH0_CLIENT_ID,
      domain: local.AUTH0_DOMAIN,
      redirectUri: local.AUTH0_CALLBACK_URL,
      audience: 'https://users.maphubs.com',
      responseType: 'code',
      scope: 'openid profile email',
      allowlogin: 'false',
      screen_hint: 'signup'
    })
  )
  app.post('/api/user/setlocale', (req, res) => {
    const data = req.body

    if (data.locale) {
      req.session.locale = data.locale
      req.setLocale(data.locale)
    }

    res.status(200).send({
      success: true
    })
  })
  // can be used to dynamically check for login status, so should be public
  app.all('/api/user/details/json', csrfProtection, async (req, res) => {
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
