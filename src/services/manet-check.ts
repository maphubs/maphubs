import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import compare from 'secure-compare'
import { NextApiRequest, NextApiResponse } from 'next'

const debug = DebugService('manet-check')

const manetCheck = function (req: NextApiRequest): boolean {
  // determine if this is the manet screenshot service
  // first check the cookie
  if (req.cookies) debug.log(JSON.stringify(req.cookies))

  if (!req.cookies || !req.cookies.manet) {
    log.error('Manet Cookie Not Found')
    return false
  } else if (!compare(req.cookies.manet, process.env.SCREENSHOT_API_KEY)) {
    log.error('Invalid Manet Key')
    return false
  } else {
    return true
  }
}

const manetMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: any
): any => {
  return process.env.NEXT_PUBLIC_REQUIRE_LOGIN !== 'true' ||
    (req.isAuthenticated && req.isAuthenticated())
    ? next()
    : manetCheck(req)
    ? next()
    : res.status(401).send('Unauthorized')
}

export { manetMiddleware, manetCheck }
