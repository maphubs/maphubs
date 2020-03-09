const local = require('./src/local')
require('./src/services/inject-maphubs-config')
const next = require('next')
const express = require('express')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({dev})
const handle = nextApp.getRequestHandler()

const passport = require('passport')
const flash = require('connect-flash')
const logger = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const i18n = require('./src/i18n')
const Raven = require('raven')
const version = require('./version.json').version
const shrinkRay = require('shrink-ray-current')
const pageOptions = require('./src/services/page-options-helper')

const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)
const knex = require('./src/connection')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

const Promise = require('bluebird')
// promise config needs to be here so it runs before anything else uses bluebird.
Promise.config({
  // Enable cancellation.
  cancellation: true
})

const CMSPages = require('./src/services/cms-pages')
nextApp.prepare()
  .then(async () => {
    const server = express()
    server.next = nextApp // needed for routes to render with NextJS
    // settings flags
    server.enable('trust proxy')
    // server.disable('view cache') // cache may be causing weird issues in production, due to our custom React view implementation
    server.disable('x-powered-by')

    log.info(`Environment: "${server.get('env')}"`)

    const ravenConfig = (process.env.NODE_ENV === 'production' && !local.disableTracking) && local.SENTRY_DSN
    Raven.config(ravenConfig, {
      release: version,
      environment: local.ENV_TAG,
      tags: {host: local.host},
      parseUser: ['id', 'display_name', 'email']
    }).install()

    server.use(Raven.requestHandler())

    server.get('/favicon.ico', (req, res) => {
      res.status(204).send()
    })

    // use compression
    server.use(shrinkRay())

    // CORS
    server.use(cors())
    server.options('*', cors())

    // by default set language based on browser 'accept-language' headers
    server.use(i18n.init)

    server.use(logger('dev', {
      skip (req) {
        // don't log every healthcheck ping
        if (req.path === '/healthcheck' || req.path === '/_next/on-demand-entries-ping') {
          return true
        }
        return false
      }
    }))
    server.use(cookieParser())
    server.use(bodyParser.json({limit: '250mb'}))
    server.use(bodyParser.urlencoded({
      limit: '250mb',
      extended: false
    }))

    // static files
    if (process.env.NODE_ENV !== 'production' || local.useLocalAssets) {
      server.use('/assets', express.static('./assets/assets'))
    }

    server.use('/css', express.static('css'))

    // set sessions (Note: putting this below static files to avoid extra overhead)
    const sessionStore = new KnexSessionStore({
      knex,
      tablename: 'maphubssessions'
    })

    sessionStore.ready = sessionStore.ready.catch(err => {
      log.error(err.message)
    })

    server.use(session({
      key: 'maphubs',
      secret: local.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      proxy: true,
      saveUninitialized: false,
      maxAge: 86400000,
      cookie: {
        path: '/',
        domain: local.host,
        secure: 'auto'
      }
    }))

    server.use((err, req, res, next) => {
      if (err) {
        log.error(err.message)
      }
      next()
    })

    // load passport auth config
    require('./src/services/auth')

    server.use(passport.initialize())
    server.use(passport.session())

    server.use(flash())

    // Handle auth failure error messages
    server.use(function (req, res, next) {
      if (req && req.query && req.query.error) {
        req.flash('error', req.query.error)
      }
      if (req && req.query && req.query.error_description) {
        req.flash('error_description', req.query.error_description)
      }
      next()
    })

    // load public routes - routes that should always be public, for example login or signup
    console.log('loading public routes')
    require('./src/routes/public-routes')(server)

    // option to require require login for everything after this point
    if (local.requireLogin) {
      server.use((req, res, next) => {
        if (req.path.startsWith('/_next')) {
          next()
        } else {
          if (req.user) { return next() }
          req.session.returnTo = req.originalUrl
          res.redirect('/login')
        }
      })
    }

    // load secure routes
    console.log('loading secure routes')
    require('./src/routes/secure')(server)

    try {
      await CMSPages(server)
    } catch (err) {
      log.error(err)
      Raven.captureException(err)
    }

    server.use((err, req, res, next) => {
      if (req.session && req.session.user) {
        const username = req.session.user.username || req.session.user.display_name
        const email = req.session.user._json.email || req.session.user.email

        Raven.mergeContext({
          user: {
            id: req.session.user.id,
            username,
            email
          }
        })
      }
      next(err)
    })

    server.use(Raven.errorHandler())

    if (process.env.NODE_ENV !== 'production') {
      server.get('/errortest', (req, res) => {
        throw new Error('TEST')
      })
    }

    server.use(async (err, req, res, next) => {
      // bypass for dynamically created tile URLs
      if (req.url.includes('/api/tiles/')) {
        next()
      } else {
        // curl https://localhost:4000/error/403 -vk
        // curl https://localhost:4000/error/403 -vkH "Accept: application/json"
        const statusCode = err.status || 500
        let statusText = ''
        const errorDetail = (process.env.NODE_ENV === 'production') ? req.__('Looks like we have a problem. A message was automatically sent to our team.') : err.stack

        switch (statusCode) {
          case 400:
            statusText = 'Bad Request'
            break
          case 401:
            statusText = 'Unauthorized'
            break
          case 403:
            statusText = 'Forbidden'
            break
          case 500:
            statusText = 'Internal Server Error'
            break
        }

        log.error(err.stack)

        if (req.accepts('html')) {
          const title = statusCode + ': ' + statusText
          return nextApp.render(req, res, '/error', await pageOptions(req, {
            title,
            props: {
              title,
              error: errorDetail,
              url: req.url,
              eventId: res.sentry
            }
          }))
        }

        if (req.accepts('json')) {
          res.status(statusCode).send({
            title: statusCode + ': ' + statusText,
            error: errorDetail,
            url: req.url
          })
        }
      }
    })

    // Fall-back on other next.js assets.
    server.get('*', (req, res) => {
      return handle(req, res)
    })

    const http = require('http')
    const httpServer = http.createServer(server)
    httpServer.setTimeout(10 * 60 * 1000) // 10 * 60 seconds * 1000 msecs
    httpServer.listen(local.internal_port, () => {
      log.info('**** STARTING SERVER ****')
      log.info('Server Running on port: ' + local.internal_port)
    })
  }).catch((err) => {
    console.error(err)
  })
