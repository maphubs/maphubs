import local from '../../local'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import siteMapUtil from '../../services/sitemap-util'
import { nextError } from '../../services/error-response'
import { SitemapStream, SitemapIndexStream } from 'sitemap'

export default function (app: any): void {
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain')

    if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN) {
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
      if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN) return res.status(404).send()
      const baseUrl = urlUtil.getBaseUrl()
      const layerUrls = await siteMapUtil.getSiteMapIndexFeatureURLs()
      const smis = new SitemapIndexStream()
      smis.write({ url: `${baseUrl}/sitemap.xml` })
      for (const url of layerUrls) {
        smis.write({ url })
      }
      smis.end()
      // send the response
      res.header('Content-Type', 'application/xml')
      smis.pipe(res).on('error', (e) => {
        throw e
      })
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/sitemap.:layer_id.xml', async (req, res, next) => {
    try {
      // not support on private sites
      if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN) return res.status(404).send()
      const layer_id = Number.parseInt(req.params.layer_id || '', 10)
      const baseUrl = urlUtil.getBaseUrl()
      const smStream = new SitemapStream({
        hostname: baseUrl
      })
      await siteMapUtil.addLayerFeaturesToSiteMap(layer_id, smStream)
      // finished adding
      smStream.end()
      // send the response
      res.header('Content-Type', 'application/xml')
      smStream.pipe(res).on('error', (e) => {
        throw e
      })
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/sitemap.xml', async (req, res, next) => {
    try {
      // not support on private sites
      if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN) return res.status(404).send()
      const baseUrl = urlUtil.getBaseUrl()
      const smStream = new SitemapStream({
        hostname: baseUrl
      })
      smStream.write({
        url: `${baseUrl}/layers`,
        changefreq: 'daily'
      })
      smStream.write({
        url: `${baseUrl}/maps`,
        changefreq: 'daily'
      })
      smStream.write({
        url: `${baseUrl}/stories`,
        changefreq: 'daily'
      })
      smStream.write({
        url: `${baseUrl}/groups`,
        changefreq: 'daily'
      })
      await siteMapUtil.addStoriesToSiteMap(smStream)
      await siteMapUtil.addMapsToSiteMap(smStream)
      await siteMapUtil.addLayersToSiteMap(smStream)
      await siteMapUtil.addGroupsToSiteMap(smStream)
      // finished adding
      smStream.end()
      // send the response
      res.header('Content-Type', 'application/xml')
      smStream.pipe(res).on('error', (e) => {
        throw e
      })
    } catch (err) {
      nextError(next)(err)
    }
  })
}
