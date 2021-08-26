import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

export default function (req, res, next: () => void): void {
  if (
    !req.isAuthenticated ||
    !req.isAuthenticated() ||
    !req.session ||
    !req.session.user
  ) {
    log.info(`Unauthorized access: ${req.originalUrl}`)
    res.status(401).send('Unauthorized, user not logged in')
  } else {
    req.user_id = req.session.user.maphubsUser.id
    next()
  }
}
