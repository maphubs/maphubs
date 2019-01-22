// @flow
const local = require('../../local')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const urlencode = require('urlencode')
module.exports = function (app: any) {
  app.get('/logout', (req, res) => {
    req.logout()
    delete req.session.user
    req.session.destroy(() => {
      const baseUrl = urlUtil.getBaseUrl()
      res.redirect(`https://maphubs.auth0.com/v2/logout?returnTo=${urlencode(baseUrl)}&client_id=${local.AUTH0_CLIENT_ID}`)
    })
  })
}
