import csurf from 'csurf'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

export default (app: any): void => {
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
