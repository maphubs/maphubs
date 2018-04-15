// @flow
const User = require('../../models/user')
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const pageOptions = require('../../services/page-options-helper')
const csrfProtection = require('csurf')({cookie: false})

module.exports = function (app: any) {
  app.get('/user/profile', csrfProtection, async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login')
    }

    const user = {
      username: req.session.user._json.username,
      email: req.session.user._json.email,
      picture: req.session.user._json.picture
    }
    app.next.render(req, res, '/auth0profile', await pageOptions(req, {
      title: req.__('User Profile') + ' - ' + MAPHUBS_CONFIG.productName, props: {user}
    }))
  })

  app.get('/api/user/search/suggestions', (req, res) => {
    if (!req.query.q) {
      apiDataError(res)
      return
    }
    const q = req.query.q
    User.getSearchSuggestions(q)
      .then((result) => {
        const suggestions = []
        result.forEach((user) => {
          suggestions.push({key: user.id, value: user.display_name})
        })
        return res.send({
          suggestions
        })
      }).catch(apiError(res, 500))
  })
}
