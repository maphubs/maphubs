import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import local from '../local'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import compare from 'secure-compare'

const debug = DebugService('manet-check')

const manetCheck = function (req: any): boolean {
  // determine if this is the manet screenshot service
  // first check the cookie
  if (req.cookies) debug.log(JSON.stringify(req.cookies))

  if (!req.cookies || !req.cookies.manet) {
    log.error('Manet Cookie Not Found')
    return false
  } else if (!compare(req.cookies.manet, local.manetAPIKey)) {
    log.error('Invalid Manet Key')
    return false
  } else {
    return true
  }
}

const manetMiddleware = (req: any, res: any, next: any): any => {
  return !process.env.NEXT_PUBLIC_REQUIRE_LOGIN ||
    (req.isAuthenticated && req.isAuthenticated())
    ? next()
    : manetCheck(req)
    ? next()
    : res.status(401).send('Unauthorized')
}

export { manetMiddleware, manetCheck }
