// @flow
module.exports = function (app: any) {
  // don't bother even rendering the error page for these...
  const quick404ErrorPages = [
    '/wp-login.php', '/xmlrpc.php'
  ]

  quick404ErrorPages.forEach(page => {
    app.get(page, (req, res) => {
      res.status(404).send()
    })
  })
}
