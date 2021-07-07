import User from '../../models/user'
import { apiError, apiDataError } from '../../services/error-response'
import csurf from 'csurf'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any): void {
  app.get('/user/profile', csrfProtection, async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login')
    }

    const user = {
      username: req.session.user._json.username,
      email: req.session.user._json.email,
      picture: req.session.user._json.picture
    }
    app.next.render(
      req,
      res,
      '/auth0profile',
      await pageOptions(req, {
        title: req.__('User Profile') + ' - ' + local.productName,
        props: {
          user
        }
      })
    )
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
        for (const user of result) {
          suggestions.push({
            key: user.id,
            value: user.display_name
          })
        }
        return res.send({
          suggestions
        })
      })
      .catch(apiError(res, 500))
  })
}
