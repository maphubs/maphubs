// @flow
const passport = require('passport')
const User = require('../../models/user')
const Admin = require('../../models/admin')
const Group = require('../../models/group')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const apiError = require('../../services/error-response').apiError
const nextError = require('../../services/error-response').nextError
const apiDataError = require('../../services/error-response').apiDataError
const Auth0Helper = require('../../services/auth0-helper')
const local = require('../../local')
const csrfProtection = require('csurf')({cookie: false})
const pageOptions = require('../../services/page-options-helper')

let mailchimp
if (!local.mapHubsPro) {
  const Mailchimp = require('mailchimp-api-v3')
  mailchimp = new Mailchimp(local.MAILCHIMP_API_KEY)
}

module.exports = function (app: any) {
  app.get('/signup/invite/:key', csrfProtection, async (req, res, next) => {
    try {
      const inviteKey = req.params.key
      if (inviteKey) {
        if (await Admin.checkInviteKey(inviteKey)) {
          const email = await Admin.useInvite(inviteKey)
          // check if auth0 already
          let existingAccount = false
          const accessToken = await Auth0Helper.getManagementToken()
          const auth0Accounts = await Auth0Helper.findUserByEmail(email, accessToken)
          if (auth0Accounts && Array.isArray(auth0Accounts) && auth0Accounts.length > 0) {
            log.info(`Found User: ${JSON.stringify(auth0Accounts)}`)
            existingAccount = true
          }
          const middleware = passport.authenticate('auth0', {
            clientID: local.AUTH0_CLIENT_ID,
            domain: local.AUTH0_DOMAIN,
            redirectUri: local.AUTH0_CALLBACK_URL,
            audience: 'https://' + local.AUTH0_DOMAIN + '/userinfo',
            responseType: 'code',
            scope: 'openid profile email',
            allowlogin: existingAccount ? 'true' : 'false',
            allowsignup: existingAccount ? 'false' : 'true',
            login_hint: email
          })
          return middleware(req, res, next)
        } else {
          return app.next.render(req, res, '/error', await pageOptions(req, {
            title: req.__('Invalid Key'),
            props: {
              title: req.__('Invite Key Invalid'),
              error: req.__('The key used was invalid or has already been used. Please contact an administrator.'),
              url: req.url
            }
          }))
        }
      } else {
        return res.redirect('/login')
      }
    } catch (err) { nextError(next)(err) }
  })

  app.get('/signup',
    passport.authenticate('auth0', {
      clientID: local.AUTH0_CLIENT_ID,
      domain: local.AUTH0_DOMAIN,
      redirectUri: local.AUTH0_CALLBACK_URL,
      audience: 'https://' + local.AUTH0_DOMAIN + '/userinfo',
      responseType: 'code',
      scope: 'openid profile email',
      allowlogin: 'false'
    }),
    (req, res) => {
      res.redirect('/')
    })

  app.post('/api/user/setlocale', (req, res) => {
    const data = req.body
    if (data.locale) {
      req.session.locale = data.locale
      req.setLocale(data.locale)
    }
    res.status(200).send({success: true})
  })

  app.post('/api/user/mailinglistsignup', csrfProtection, (req, res) => {
    const data = req.body
    if (data.email) {
      mailchimp.post({
        path: '/lists/' + local.MAILCHIMP_LIST_ID + '/members',
        body: {
          'email_address': data.email,
          'status': 'subscribed'
        }
      }, (err) => {
        if (err) {
          log.error(err)
          res.status(200).send({success: false, error: err})
        } else {
          res.status(200).send({success: true})
        }
      })
    } else {
      apiDataError(res)
    }
  })

  // can be used to dynamically check for login status, so should be public
  app.all('/api/user/details/json', async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(200).send({user: null})
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

        return res.status(200).send({user})
      } catch (err) { apiError(res, 200)(err) }
    }
  })
}
