export default function (app: any): void {
  // don't bother even rendering the error page for these...
  const quick404ErrorPages = ['/wp-login.php', '/xmlrpc.php']
  for (const page of quick404ErrorPages) {
    app.get(page, (req, res) => {
      res.status(404).send()
    })
  }
}
