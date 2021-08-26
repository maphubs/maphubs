import { GetServerSideProps } from 'next'
import React from 'react'

const Robots: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (res) {
    res.setHeader('Content-Type', 'text/plain')

    if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true') {
      // disallow everything
      res.write('User-agent: *\nDisallow: /')
    } else {
      // don't crawl exports
      res.write(`User-agent: *
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
    res.end()
    return {
      props: {}
    }
  }
}

export default Robots
