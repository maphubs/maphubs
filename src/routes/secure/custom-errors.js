// @flow
module.exports = function (app: any) {
  app.get('/unauthorized', (req, res) => {
    let path = ''
    if (req.query.path) {
      path = req.query.path
    }

    let sentryId
    if (req.sentry) {
      sentryId = req.sentry.id
    }

    res.status(401)
    res.render('error', {
      title: req.__('Unauthorized'),
      props: {
        title: req.__('Unauthorized'),
        error: req.__('You are not authorized to access this page.'),
        url: path,
        eventId: sentryId
      },
      req})
  })

  app.get('/notfound', (req, res) => {
    let path = ''
    if (req.query.path) {
      path = req.query.path
    }

    res.status(404)
    res.render('error', {
      title: req.__('Page not found'),
      props: {
        title: req.__('Page not found'),
        error: req.__('The page you requested was not found.'),
        url: path,
        eventId: req.sentry ? req.sentry.id : undefined
      },
      req})
  })
}
