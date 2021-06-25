module.exports = function (app: any) {
  require('./auth')(app)

  require('./layer-exports')(app)

  require('./public-maps')(app)

  require('./screenshots')(app)

  require('./user')(app)

  require('./healthcheck')(app)

  require('./layer-tilejson')(app)

  require('./quick-404')(app)

  require('./sitemap')(app)
}
