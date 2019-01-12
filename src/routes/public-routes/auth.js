// @flow
const passport = require('passport')
const local = require('../../local')
// var log = require('@bit/kriscarle.maphubs-utils.services.log');
const urlencode = require('urlencode')
const pageOptions = require('../../services/page-options-helper')

module.exports = function (app: any) {
  function checkReturnTo (req, res, next) {
    const returnTo = req.query['returnTo']
    if (returnTo) {
      // Maybe unnecessary, but just to be sure.
      req.session = req.session || {}

      // Set returnTo to the absolute path you want to be redirect to after the authentication succeeds.
      req.session.returnTo = urlencode.decode(returnTo)
    }
    next()
  }

  app.get('/login', checkReturnTo,
    passport.authenticate('auth0', {
      clientID: local.AUTH0_CLIENT_ID,
      domain: local.AUTH0_DOMAIN,
      redirectUri: local.AUTH0_CALLBACK_URL,
      audience: 'https://' + local.AUTH0_DOMAIN + '/userinfo',
      responseType: 'code',
      scope: 'openid profile email',
      allowsignup: 'false'
    }),
    (req, res) => {
      res.redirect('/')
    })

  // Perform the final stage of authentication and redirect to '/user'
  app.get('/callback',
    passport.authenticate('auth0', {failureRedirect: '/login/failed'}),
    (req, res) => {
      req.session.user = req.user
      if (req.session.returnTo === '/public/auth0login.css') {
        req.session.returnTo = ''
      }

      req.session.save(() => {
        res.redirect(req.session.returnTo || '/')
      })
    })

  app.get('/login/failed', async (req, res) => {
    return app.next.render(req, res, '/auth0error', await pageOptions(req, {
      title: req.__('Login Failed') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        requireInvite: local.requireInvite,
        adminEmail: local.adminEmail
      },
      login: true
    }))
  })
}
