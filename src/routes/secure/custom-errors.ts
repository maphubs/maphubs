import pageOptions from '../../services/page-options-helper'

export default function (app: any): void {
  app.get('/unauthorized', async (req, res) => {
    let path = ''

    if (req.query.path) {
      path = req.query.path
    }

    let sentryId

    if (req.sentry) {
      sentryId = req.sentry.id
    }

    res.status(401)
    app.next.render(
      req,
      res,
      '/error',
      await pageOptions(req, {
        title: req.__('Unauthorized'),
        props: {
          title: req.__('Unauthorized'),
          error: req.__('You are not authorized to access this page.'),
          url: path,
          eventId: sentryId
        }
      })
    )
  })
  app.get('/notfound', async (req, res) => {
    let path = ''

    if (req.query.path) {
      path = req.query.path
    }

    res.status(404)
    app.next.render(
      req,
      res,
      '/error',
      await pageOptions(req, {
        title: req.__('Page not found'),
        props: {
          title: req.__('Page not found'),
          error: req.__('The page you requested was not found'),
          url: path,
          eventId: req.sentry ? req.sentry.id : undefined
        }
      })
    )
  })
}
