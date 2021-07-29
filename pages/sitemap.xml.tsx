import { GetServerSideProps } from 'next'
import React from 'react'
import urlUtil from '../src/services/url-util'
import siteMapUtil from '../src/services/sitemap-util'
import { SitemapStream } from 'sitemap'

const Sitemap: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (res) {
    // not supported on private sites
    if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true') {
      return {
        notFound: true
      }
    }
    const baseUrl = urlUtil.getBaseUrl()
    console.log(`baseUrl: ${baseUrl}`)
    res.setHeader('Content-Type', 'application/xml')

    const smStream = new SitemapStream({
      hostname: baseUrl
    })
    smStream.pipe(res).on('error', (e) => {
      throw e
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
    res.setHeader('Content-Type', 'application/xml')
  }
  return {
    props: {}
  }
}

export default Sitemap
