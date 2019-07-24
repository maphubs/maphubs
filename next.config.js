const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')
const path = require('path')
const withTM = require('next-transpile-modules')
const lessToJS = require('less-vars-to-js')
const config = require('./src/local')
const fs = require('fs')
const {styles} = require('@ckeditor/ckeditor5-dev-utils')

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  // eslint-disable-next-line node/no-deprecated-api
  require.extensions['.less'] = (file) => {}
}

const {ANALYZE, ASSET_CDN_PREFIX} = process.env

if (ANALYZE) {
  var { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
}

const useCDN = (ASSET_CDN_PREFIX && process.env.NODE_ENV === 'production')
const pathToMapboxGL = path.resolve(__dirname, './node_modules/mapbox-gl/dist/mapbox-gl.js')
const assetPrefix = useCDN ? ASSET_CDN_PREFIX : ''
console.log(`assetPrefix: ${assetPrefix}`)

const postCSSConfig = styles.getPostCssConfig({
  themeImporter: {
    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
  },
  minify: true
})

const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './theme.less'), 'utf8')
)

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.less'] = file => {}
}

module.exports = withLess(withCSS(withTM({
  publicRuntimeConfig: {
    host: config.host,
    port: config.port,
    https: config.https,
    productName: config.productName,
    logo: config.logo,
    logoSmall: config.logoSmall,
    logoWidth: config.logoWidth,
    logoHeight: config.logoHeight,
    logoSmallWidth: config.logoSmallWidth,
    logoSmallHeight: config.logoSmallHeight,
    primaryColor: config.primaryColor,
    betaText: config.betaText,
    twitter: config.twitter,
    contactEmail: config.contactEmail,
    mapHubsPro: config.mapHubsPro,
    enableComments: config.enableComments,
    CORAL_TALK_ID: config.CORAL_TALK_ID,
    CORAL_TALK_HOST: config.CORAL_TALK_HOST,
    FR_ENABLE: config.FR_ENABLE,
    FR_API: config.FR_API,
    FR_API_KEY: config.FR_API_KEY,
    tileServiceUrl: config.tileServiceUrl,
    MAPBOX_ACCESS_TOKEN: config.MAPBOX_ACCESS_TOKEN,
    TILEHOSTING_GEOCODING_API_KEY: config.TILEHOSTING_GEOCODING_API_KEY,
    TILEHOSTING_MAPS_API_KEY: config.TILEHOSTING_MAPS_API_KEY,
    PLANET_LABS_API_KEY: config.PLANET_LABS_API_KEY,
    DG_WMS_CONNECT_ID: config.DG_WMS_CONNECT_ID,
    BING_KEY: config.BING_KEY,
    SENTRY_DSN_PUBLIC: config.SENTRY_DSN_PUBLIC,
    theme: config.theme,
    themeUrl: config.themeUrl,
    enableUserExport: config.enableUserExport,
    OPENROUTESERVICE_API_KEY: config.OPENROUTESERVICE_API_KEY,
    EARTHENGINE_CLIENTID: config.EARTHENGINE_CLIENTID,
    RASTER_UPLOAD_API: config.RASTER_UPLOAD_API,
    RASTER_UPLOAD_API_KEY: config.RASTER_UPLOAD_API_KEY,
    LANGUAGES: config.LANGUAGES
  },
  transpileModules: ['react-dnd', 'react-dnd-html5-backend'],
  lessLoaderOptions: {
    modifyVars: themeVariables,
    javascriptEnabled: true
  },
  postcssLoaderOptions: postCSSConfig,
  exportPathMap: () => {
    return {}
  },
  assetPrefix,
  poweredByHeader: false,
  webpack (config, { dev }) {
    if (dev) {
      /// config.devtool = 'cheap-eval-source-map'
      config.devtool = 'cheap-eval-source-map'
    } else {
      config.devtool = 'source-map'
      if (config.optimization && config.optimization.minimizer) {
        for (const plugin of config.optimization.minimizer) {
          if (plugin.constructor.name === 'TerserPlugin') {
            plugin.options.sourceMap = true
            break
          }
        }
      }
    }

    if (!config.node) config.node = {}
    config.node.fs = 'empty'

    config.module.rules.push({
      test: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/,
      use: [ 'raw-loader' ]
    })

    config.module.rules.push({
      test: /\.(woff|ttf|eot|gif)([\?]?.*)$/,
      use: [{
        loader: 'file-loader',
        options: { publicPath: '/_next/static/', outputPath: 'static/' }
      }]
    })

    config.module.rules.push({
      test: /\.(glsl|vert|frag)([\?]?.*)$/,
      use: [{ loader: 'raw-loader' }]
    })

    if (!config.module.noParse) {
      config.module.noParse = []
    }
    config.module.noParse.push(pathToMapboxGL)

    if (ANALYZE) {
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: dev ? 8888 : 8889,
        openAnalyzer: true
      }))
    }

    return config
  }
})))
