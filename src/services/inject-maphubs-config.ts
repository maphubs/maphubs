// this this is not the browser
if (process.env.APP_ENV !== 'browser') {
  const local = require('../local')

  global.MAPHUBS_CONFIG = {
    host: local.host,
    port: local.port,
    https: local.https,
    productName: local.productName,
    logo: local.logo,
    logoSmall: local.logoSmall,
    logoWidth: local.logoWidth,
    logoHeight: local.logoHeight,
    logoSmallWidth: local.logoSmallWidth,
    logoSmallHeight: local.logoSmallHeight,
    primaryColor: local.primaryColor,
    betaText: local.betaText,
    twitter: local.twitter,
    contactEmail: local.contactEmail,
    mapHubsPro: local.mapHubsPro,
    enableComments: local.enableComments,
    CORAL_TALK_HOST: local.CORAL_TALK_HOST,
    FR_ENABLE: local.FR_ENABLE,
    FR_API: local.FR_API,
    FR_API_KEY: local.FR_API_KEY,
    tileServiceUrl: local.tileServiceUrl,
    MAPBOX_ACCESS_TOKEN: local.MAPBOX_ACCESS_TOKEN,
    TILEHOSTING_GEOCODING_API_KEY: local.TILEHOSTING_GEOCODING_API_KEY,
    TILEHOSTING_MAPS_API_KEY: local.TILEHOSTING_MAPS_API_KEY,
    PLANET_LABS_API_KEY: local.PLANET_LABS_API_KEY,
    DG_WMS_CONNECT_ID: local.DG_WMS_CONNECT_ID,
    BING_KEY: local.BING_KEY,
    SENTRY_DSN_PUBLIC: local.SENTRY_DSN_PUBLIC,
    theme: local.theme,
    themeUrl: local.themeUrl,
    enableUserExport: local.enableUserExport,
    OPENROUTESERVICE_API_KEY: local.OPENROUTESERVICE_API_KEY,
    EARTHENGINE_CLIENTID: local.EARTHENGINE_CLIENTID,
    RASTER_UPLOAD_API: local.RASTER_UPLOAD_API,
    RASTER_UPLOAD_API_KEY: local.RASTER_UPLOAD_API_KEY
  }
  console.log(global.MAPHUBS_CONFIG)
}