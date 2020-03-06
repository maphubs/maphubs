// @flow
const local = require('../../local')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const siteMapUtil = require('../../services/sitemap-util')
const nextError = require('../../services/error-response').nextError
const { SitemapStream, buildSitemapIndex } = require('sitemap')

module.exports = function (app: any) {
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

  app.get('/sitemapindex.xml', async (req, res, next) => {
    try {
      // not support on private sites
      if (local.requireLogin) return res.status(404).send()

      const baseUrl = urlUtil.getBaseUrl()

      const layerUrls = await siteMapUtil.getSiteMapIndexFeatureURLs()
      const smi = buildSitemapIndex({
        urls: [`${baseUrl}/sitemap.xml`].concat(layerUrls)
      })
      res.header('Content-Type', 'application/xml')
      return res.send(smi)
    } catch (err) {
      nextError(next)(err)
    }
  })

  app.get('/sitemap.:layer_id.xml', async (req, res, next) => {
    try {
      // not support on private sites
      if (local.requireLogin) return res.status(404).send()

      const layer_id = parseInt(req.params.layer_id || '', 10)

      const baseUrl = urlUtil.getBaseUrl()
      const smStream = new SitemapStream({ hostname: baseUrl })

      await siteMapUtil.addLayerFeaturesToSiteMap(layer_id, smStream)
      // finished adding
      smStream.end()

      // send the response
      res.header('Content-Type', 'application/xml')
      smStream.pipe(res).on('error', (e) => { throw e })
    } catch (err) {
      nextError(next)(err)
    }
  })

  app.get('/sitemap.xml', async (req, res, next) => {
    try {
      // not support on private sites
      if (local.requireLogin) return res.status(404).send()

      const baseUrl = urlUtil.getBaseUrl()
      const smStream = new SitemapStream({ hostname: baseUrl })
      smStream.write({ url: `${baseUrl}/layers`, changefreq: 'daily' })
      smStream.write({ url: `${baseUrl}/maps`, changefreq: 'daily' })
      smStream.write({ url: `${baseUrl}/stories`, changefreq: 'daily' })
      smStream.write({ url: `${baseUrl}/groups`, changefreq: 'daily' })

      await siteMapUtil.addStoriesToSiteMap(smStream)
      await siteMapUtil.addMapsToSiteMap(smStream)
      await siteMapUtil.addLayersToSiteMap(smStream)
      await siteMapUtil.addGroupsToSiteMap(smStream)
      // finished adding
      smStream.end()

      // send the response
      res.header('Content-Type', 'application/xml')
      smStream.pipe(res).on('error', (e) => { throw e })
    } catch (err) {
      nextError(next)(err)
    }
  })
}
