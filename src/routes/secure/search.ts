const csrfProtection = require('csurf')({
  cookie: false
})

const pageOptions = require('../../services/page-options-helper')

const local = require('../../local')

module.exports = (app: any) => {
  app.get('/search', csrfProtection, async (req, res) => {
    return app.next.render(
      req,
      res,
      '/search',
      await pageOptions(req, {
        title: req.__('Search') + ' - ' + local.productName,
        props: {}
      })
    )
  })
}