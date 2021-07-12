const path = require('path')
/*
const withTM = require('next-transpile-modules')([
  'react-dnd',
  'dnd-core',
  'react-dnd-html5-backend',
  '@mapbox/mapbox-gl-draw'
])
*/
const withAntdLess = require('next-plugin-antd-less')
const { getThemeVariables } = require('antd/dist/theme')
const lessToJS = require('less-vars-to-js')
const config = require('./src/local')
const fs = require('fs')
// const { styles } = require('@ckeditor/ckeditor5-dev-utils')

const { ASSET_CDN_PREFIX } = process.env

const useCDN = ASSET_CDN_PREFIX && process.env.NODE_ENV === 'production'
const assetPrefix = useCDN ? ASSET_CDN_PREFIX : ''
console.log(`assetPrefix: ${assetPrefix}`)

/*
const postCSSConfig = styles.getPostCssConfig({
  themeImporter: {
    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
  },
  minify: true
})
*/

const antdThemeVariables = getThemeVariables({
  dark: false,
  compact: false
})

const customThemeVariables = lessToJS(
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(path.resolve(__dirname, './theme.less'), 'utf8')
)

const themeVariables = Object.assign(antdThemeVariables, customThemeVariables)

// get a list of Antd vars to customize
//console.log(themeVariables)

module.exports = withAntdLess({
  typescript: {
    ignoreBuildErrors: true
  },
  productionBrowserSourceMaps: true,
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
    ASSET_UPLOAD_API: config.ASSET_UPLOAD_API,
    ASSET_UPLOAD_API_KEY: config.ASSET_UPLOAD_API_KEY,
    LANGUAGES: config.LANGUAGES,
    RASTER_UPLOAD_FILE_SIZE_LIMIT: config.RASTER_UPLOAD_FILE_SIZE_LIMIT
  },
  // postcssLoaderOptions: postCSSConfig,
  assetPrefix,
  poweredByHeader: false,
  modifyVars: themeVariables,
  webpack(config, { dev, isServer }) {
    return config
  }
})
