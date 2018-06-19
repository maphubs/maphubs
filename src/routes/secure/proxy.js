// @flow
const proxy = require('express-http-proxy')
const debug = require('../../services/debug')('proxy')
const local = require('../../local')

module.exports = function (app: any) {
  // if tiles requests make it to the web app, proxy them from here
  // needed for generating screenshots on local MapHubs Pro deployments
  app.use('/tiles', proxy(local.tileServiceInternalUrl, {
    proxyReqPathResolver (req) {
      const url: Object = require('url').parse(req.url)
      const path = '/tiles' + url.path
      debug.log(path)
      return path
    }
  }))

  app.use('/screenshots/*', proxy(local.manetUrl, {
    proxyReqPathResolver (req) {
      const url: Object = require('url').parse(req.url)
      const path = url.path
      debug.log(path)
      return path
    }
  }))
}
