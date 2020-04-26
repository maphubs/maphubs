// @flow
const passport = require('passport')
const local = require('../../local')
// var log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log');
const urlencode = require('urlencode')
const pageOptions = require('../../services/page-options-helper')

function checkReturnTo (req, res, next) {
  const returnTo = req.query.returnTo
  if (returnTo) {
    // Maybe unnecessary, but just to be sure.
    req.session = req.session || {}

    // Set returnTo to the absolute path you want to be redirected to after the authentication succeeds.
    req.session.returnTo = urlencode.decode(returnTo)
  }
  next()
}

module.exports = function (app: any) {
  app.get('/login', checkReturnTo,
    passport.authenticate('auth0', {
      clientID: local.AUTH0_CLIENT_ID,
      domain: local.AUTH0_DOMAIN,
      redirectUri: local.AUTH0_CALLBACK_URL,
      audience: 'https://' + local.AUTH0_DOMAIN + '/userinfo',
      responseType: 'code',
      scope: 'openid email profile'
    }),
    (req, res) => {
      res.redirect('/')
    })
  /*
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
 */
  app.get('/callback', function (req, res, next) {
    passport.authenticate('auth0', function (err, user, info) {
      if (err) { return res.redirect(`/login/failed?err=${err.message}`) }
      if (!user) { return res.redirect('/login') }
      req.logIn(user, (err) => {
        if (err) { return res.redirect(`/login/failed?err=${err.message}`) }
        req.session.user = req.user
        req.session.save(() => {
          const returnTo = req.session.returnTo
          delete req.session.returnTo
          res.redirect(returnTo || '/')
        })
      })
    })(req, res, next)
  })

  app.get('/login/failed', async (req, res) => {
    return app.next.render(req, res, '/auth0error', await pageOptions(req, {
      title: req.__('Login Failed') + ' - ' + local.productName,
      props: {
        requireInvite: local.requireInvite,
        adminEmail: local.adminEmail,
        error: req.query.err
      },
      login: true
    }))
  })
}
