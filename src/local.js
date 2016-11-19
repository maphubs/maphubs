var path = require('path');
var getenv = require('getenv');
getenv.disableErrors();

module.exports = {
  connection: {
    url: 'postgres://' + getenv('DB_USER') + ':'+ getenv('DB_PASS') +'@' + getenv('DB_HOST') + ':' + getenv('DB_PORT') + '/' + getenv('DB_DATABASE')
  },
  host: getenv('OMH_HOST'),
  host_internal:  getenv('OMH_HOST_INTERNAL'),
  port: getenv.int('OMH_PORT'),
  internal_port: getenv.int('OMH_INTERNAL_PORT'),
  publicFilePath: path.join(__dirname, '../public'),
  tempFilePath: path.join(__dirname, '../temp'),
  manetUrl: getenv('OMH_MANET_URL'),
  tileServiceUrl: getenv('OMH_TILESERVICE_URL'),
  tileServiceInternalUrl: getenv('OMH_TILESERVICE_INTERNAL_URL'),
  MAPBOX_ACCESS_TOKEN: getenv('OMH_MAPBOX_TOKEN'),
  MAILGUN_API_KEY: getenv('OMH_MAILGUN_API_KEY'),
  LOGGLY_API_KEY: getenv('OMH_LOGGLY_API_KEY'),
  MAILCHIMP_LIST_ID: getenv('OMH_MAILCHIMP_LIST_ID'),
  MAILCHIMP_API_KEY: getenv('OMH_MAILCHIMP_API_KEY'),
  NEWRELIC_APP_NAME: getenv('OMH_NEWRELIC_APP_NAME'),
  NEWRELIC_LICENSE: getenv('OMH_NEWRELIC_LICENSE'),
  NEWRELIC_LOG_LEVEL: getenv('OMH_NEWRELIC_LOG_LEVEL'),
  ENV_TAG:  getenv('OMH_ENV_TAG'),
  SESSION_SECRET:  getenv('OMH_SESSION_SECRET'),
  disableTracking:  getenv.bool('OMH_DISABLE_TRACKING', false),
  mapHubsPro: getenv.bool('OMH_MAPHUBS_PRO', false),
  fromEmail: getenv('OMH_FROM_EMAIL'),
  adminEmail: getenv('OMH_ADMIN_EMAIL'),
  database: {
    host:getenv('DB_HOST'),
    user: getenv('DB_USER'),
    database: getenv('DB_DATABASE'),
    password: getenv('DB_PASS'),
    port: getenv('DB_PORT')
  },
  writeDebugData: getenv.bool('OMH_WRITEDEBUGDATA', false),
  requireLogin: getenv.bool('OMH_REQUIRE_LOGIN', false),
  requireInvite: getenv.bool('OMH_REQUIRE_INVITE', false),
  manetAPIKey: getenv('OMH_MANET_API_KEY')
};
