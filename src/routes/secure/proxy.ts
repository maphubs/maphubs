import proxy from 'express-http-proxy'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import local from '../../local'

const debug = DebugService('proxy')

export default function (app: any): void {
  // if tiles requests make it to the web app, proxy them from here
  // needed for generating screenshots on local MapHubs Pro deployments
  app.use(
    '/tiles',
    proxy(local.tileServiceInternalUrl, {
      proxyReqPathResolver(req) {
        const url = new URL(req.url)
        const path = '/tiles' + url.pathname
        debug.log(path)
        return path
      }
    })
  )
  app.use(
    '/screenshots/*',
    proxy(process.env.SCREENSHOT_SERVICE_URL, {
      proxyReqPathResolver(req) {
        const url = new URL(req.url)
        const path = url.pathname
        debug.log(path)
        return path
      }
    })
  )
}
