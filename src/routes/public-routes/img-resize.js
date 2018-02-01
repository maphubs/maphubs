// @flow
const scale = require('express-sharp')
const local = require('../../local')

module.exports = function (app: any) {
  let baseHost = local.host_internal
  if (local.port !== 80) {
    baseHost += ':' + local.internal_port
  }

  if (!local.requireLogin) {
    const options = {baseHost}
    app.use('/img', (req, res, next) => {
      if (!req.query.url) {
        res.status(400).send('expected image url')
      } else {
        const url = req.query.url
        if (local.requireLogin) {
          // if it is a known public share URL allow it
          if (url.startsWith('/api/map/share/screenshot')) {
            next()
          } else {
            // otherwise we redirect the user to it
            res.redirect(req.query.url)
          }
        } else {
          // TODO: check for private 
          next()
        }
      }
    }, scale(options))
  } else {
    app.get('/img/*', (req, res) => {
      if (!req.query.url) {
        res.status(400).send('expected image url')
      } else {
        res.redirect(req.query.url)
      }
    })
  }
}
