const local = require('../../local')
const urlUtil = require('../../services/url-util')
const siteMapUtil = require('../../services/sitemap-util')
const Promise = require('bluebird')
// var log = require('../../services/log');
const nextError = require('../../services/error-response').nextError
const knex = require('../../connection')

const sitemap = require('sitemap')
const sm = sitemap.createSitemap({
  hostname: urlUtil.getBaseUrl(),
  sitemapName: 'Maphubs'
})

module.exports = function (app) {
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain')
    if (local.requireLogin) {
      // disallow everything
      res.send('User-agent: *\nDisallow: /')
    } else {
      // don't crawl exports
      res.send(`User-agent: *
Disallow: /*.kml$
Disallow: /*.maphubs$
Disallow: /*.zip$
Disallow: /*.geojson$
Disallow: /*.gpx$
Disallow: /*.csv$
Disallow: /*.svg$
Disallow: /*.pbf$
Disallow: /xml/map/*
`)
    }
  })

  app.get('/sitemapindex.xml', (req, res, next) => {
    if (local.requireLogin) {
      return res.status(404).send()
    }
    const baseUrl = urlUtil.getBaseUrl()
    knex.transaction((trx) => {
      return siteMapUtil.getSiteMapIndexFeatureURLs(trx)
        .then(layerUrls => {
          const smi = sitemap.buildSitemapIndex({
            urls: [baseUrl + '/sitemap.xml'].concat(layerUrls)
          })
          res.header('Content-Type', 'application/xml')
          return res.send(smi)
        })
    }).catch(nextError(next))
  })

  app.get('/sitemap.:layer_id.xml', async (req, res, next) => {
    if (local.requireLogin) {
      return res.status(404).send()
    }
    const layer_id = parseInt(req.params.layer_id || '', 10)
    // clear sitemap
    sm.urls = []
    knex.transaction(async (trx) => {
      await siteMapUtil.addLayerFeaturesToSiteMap(layer_id, sm, trx)
      const xml = await Promise.promisify(sm.toXML, {context: sm})()
      res.header('Content-Type', 'application/xml')
      return res.send(xml)
    }).catch(nextError(next))
  })

  app.get('/sitemap.xml', (req, res, next) => {
    if (local.requireLogin) {
      return res.status(404).send()
    }
    const baseUrl = urlUtil.getBaseUrl()
    // clear sitemap
    sm.urls = [
      {url: baseUrl + '/layers', changefreq: 'daily'},
      {url: baseUrl + '/maps', changefreq: 'daily'},
      {url: baseUrl + '/stories', changefreq: 'daily'},
      {url: baseUrl + '/hubs', changefreq: 'daily'},
      {url: baseUrl + '/groups', changefreq: 'daily'}
    ]

    knex.transaction(async (trx) => {
      await siteMapUtil.addHubsToSiteMap(sm, trx)
      await siteMapUtil.addStoriesToSiteMap(sm, trx)
      await siteMapUtil.addMapsToSiteMap(sm, trx)
      await siteMapUtil.addLayersToSiteMap(sm, trx)
      await siteMapUtil.addGroupsToSiteMap(sm, trx)

      const xml = await Promise.promisify(sm.toXML, {context: sm})()
      res.header('Content-Type', 'application/xml')
      return res.send(xml)
    }).catch(nextError(next))
  })
}
