const next = require('next')
const express = require('express')

require('@babel/register')()

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const i18n = require('./src/i18n')
const version = require('./version.json').version

const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

const CMSPages = require('./src/services/cms-pages')
import PublicRoutes from './src/routes/public-routes/index'
import SecureRoutes from './src/routes/secure/index'

nextApp
  .prepare()
  .then(async () => {
    const server = express()
    server.next = nextApp // needed for routes to render with NextJS
    // settings flags
    server.enable('trust proxy')
    // server.disable('view cache') // cache may be causing weird issues in production, due to our custom React view implementation
    server.disable('x-powered-by')

    log.info(`Environment: "${server.get('env')}"`)

    // CORS
    server.use(cors())
    server.options('*', cors())

    // by default set language based on browser 'accept-language' headers
    server.use(i18n.init)

    server.use(bodyParser.json({ limit: '250mb' }))
    server.use(
      bodyParser.urlencoded({
        limit: '250mb',
        extended: false
      })
    )

    // static files
    if (process.env.NODE_ENV !== 'production' || local.useLocalAssets) {
      server.use('/assets', express.static('./assets/assets'))
    }

    // load public routes - routes that should always be public, for example login or signup
    console.log('loading public routes')
    PublicRoutes(server)

    // option to require require login for everything after this point
    if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true') {
      server.use((req, res, next) => {
        if (
          req.path.startsWith('/_next') ||
          req.path.startsWith('/__get-internal-source')
        ) {
          next()
        } else {
          if (req.user) {
            return next()
          }
          req.session.returnTo = req.originalUrl
          res.redirect('/login')
        }
      })
    }

    // load secure routes
    console.log('loading secure routes')
    SecureRoutes(server)

    try {
      await CMSPages(server)
    } catch (err) {
      log.error(err)
      // TODO: capture Sentry error
    }

    // Fall-back on other next.js assets.
    server.get('*', (req, res) => {
      return handle(req, res)
    })

    const httpServer = http.createServer(server)
    httpServer.setTimeout(10 * 60 * 1000) // 10 * 60 seconds * 1000 msecs
    httpServer.listen(local.internal_port, () => {
      log.info('**** STARTING SERVER ****')
      log.info('Server Running on port: ' + local.internal_port)
    })
  })
  .catch((err) => {
    console.error(err)
  })
