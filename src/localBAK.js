var path = require('path')
require('dotenv').config()
var getenv = require('getenv')
getenv.disableErrors()

var tempPath = getenv('OMH_TEMP_FILE_PATH')
if (!tempPath || tempPath === 'undefined') {
  tempPath = path.join(__dirname, '../temp')
}

var local = {
  connection: {
    url: `postgres://${getenv('DB_USER')}:${getenv('DB_PASS')}@${getenv(
      'DB_HOST'
    )}:${getenv('DB_PORT')}/${getenv('DB_DATABASE')}`
  },
  host: getenv('OMH_HOST'),
  host_internal: getenv('OMH_HOST_INTERNAL'),
  port: getenv.int('OMH_PORT'),
  https: getenv.bool('OMH_HTTPS', true),
  internal_port: getenv.int('OMH_INTERNAL_PORT'),
  publicFilePath: path.join(__dirname, '../assets/public'),
  tempFilePath: tempPath,
  productName: getenv('OMH_PRODUCT_NAME'),
  logo: getenv('OMH_LOGO'),
  logoWidth: getenv.int('OMH_LOGO_WIDTH'),
  logoHeight: getenv.int('OMH_LOGO_HEIGHT'),
  primaryColor: getenv('OMH_PRIMARY_COLOR'),
  enableComments: getenv.bool('OMH_ENABLE_COMMENTS', false),
  CORAL_TALK_HOST: getenv('CORAL_TALK_HOST'),
  CORAL_TALK_SECRET: getenv('CORAL_TALK_SECRET'),
  FR_ENABLE: getenv.bool('FR_ENABLE', false),
  FR_API: getenv('FR_API'),
  FR_API_KEY: getenv('FR_API_KEY'),
  PLANET_LABS_API_KEY: getenv('PLANET_LABS_API_KEY'),
  DG_WMS_CONNECT_ID: getenv('DG_WMS_CONNECT_ID'),
  BING_KEY: getenv('BING_API_KEY'),
  theme: getenv('OMH_THEME'),
  themeUrl: getenv('OMH_THEME_URL', ''),
  enableUserExport: getenv.bool('OMH_ENABLE_USER_EXPORT', false),
  tileServiceUrl: getenv('OMH_TILESERVICE_URL'),
  tileServiceInternalUrl: getenv('OMH_TILESERVICE_INTERNAL_URL'),
  MAPBOX_ACCESS_TOKEN: getenv('MAPBOX_ACCESS_TOKEN'),
  TILEHOSTING_GEOCODING_API_KEY: getenv('TILEHOSTING_GEOCODING_API_KEY'),
  TILEHOSTING_MAPS_API_KEY: getenv('TILEHOSTING_MAPS_API_KEY'),
  OPENROUTESERVICE_API_KEY: getenv('OPENROUTESERVICE_API_KEY'),
  useLocalAuth: getenv.bool('OMH_USE_LOCAL_AUTH', false),
  GOOGLE_ANALYTICS_ID: getenv('OMH_GOOGLE_ANALYTICS_ID'),
  FACEBOOK_APP_ID: getenv('OMH_FACEBOOK_APP_ID'),
  ENV_TAG: getenv('OMH_ENV_TAG'),
  SESSION_SECRET: getenv('OMH_SESSION_SECRET'),
  mapHubsPro: getenv.bool('OMH_MAPHUBS_PRO', false),
  fromEmail: getenv('OMH_FROM_EMAIL'),
  adminEmail: getenv('OMH_ADMIN_EMAIL'),
  database: {
    host: getenv('DB_HOST'),
    user: getenv('DB_USER'),
    database: getenv('DB_DATABASE'),
    password: getenv('DB_PASS'),
    port: getenv('DB_PORT')
  },
  writeDebugData: getenv.bool('OMH_WRITEDEBUGDATA', false),
  requireLogin: getenv.bool('OMH_REQUIRE_LOGIN', false),
  requireInvite: getenv.bool('OMH_REQUIRE_INVITE', false),
  manetAPIKey: getenv('OMH_MANET_API_KEY'),
  useLocalAssets: getenv.bool('OMH_USE_LOCAL_ASSETS', false),
  ASSET_CDN_PREFIX: getenv('ASSET_CDN_PREFIX'),
  EARTHENGINE_CLIENTID: getenv('EARTHENGINE_CLIENTID'),
  RASTER_UPLOAD_API: getenv('RASTER_UPLOAD_API'),
  RASTER_UPLOAD_API_KEY: getenv('RASTER_UPLOAD_API_KEY'),
  ASSET_UPLOAD_API: getenv('ASSET_UPLOAD_API'),
  ASSET_UPLOAD_API_KEY: getenv('ASSET_UPLOAD_API_KEY'),
  LANGUAGES: getenv('LANGUAGES', 'en,fr,es,pt,id,it,de'),
  RASTER_UPLOAD_FILE_SIZE_LIMIT: getenv.int(
    'RASTER_UPLOAD_FILE_SIZE_LIMIT',
    157286400
  ),
  HIDE_FEEDBACK: getenv.bool('HIDE_FEEDBACK', false)
}

module.exports = local
