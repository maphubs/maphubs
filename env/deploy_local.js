//Development
module.exports = {
  connection: {
    url: 'postgres://' + process.env.DB_USER + ':'+ process.env.DB_PASS +'@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE
  },
  host: process.env.OMH_HOST ? process.env.OMH_HOST : process.env.TUTUM_SERVICE_FQDN,
  port: process.env.OMH_PORT,
  internal_port: process.env.OMH_INTERNAL_PORT,
  publicFilePath: '/app/public/',
  tempFilePath: '/app/temp/',
  manetUrl: process.env.OMH_MANET_URL,
  tileServiceUrl: process.env.OMH_TILESERVICE_URL,
  tileServiceInternalUrl: process.env.OMH_TILESERVICE_INTERNAL_URL,
  MAPBOX_ACCESS_TOKEN: process.env.OMH_MAPBOX_TOKEN,
  MAILGUN_API_KEY: process.env.OMH_MAILGUN_API_KEY,
  LOGGLY_API_KEY: process.env.OMH_LOGGLY_API_KEY,
  MAILCHIMP_LIST_ID: process.env.OMH_MAILCHIMP_LIST_ID,
  MAILCHIMP_API_KEY: process.env.OMH_MAILCHIMP_API_KEY,
  NEWRELIC_APP_NAME: process.env.OMH_NEWRELIC_APP_NAME,
  NEWRELIC_LICENSE: process.env.OMH_NEWRELIC_LICENSE,
  NEWRELIC_LOG_LEVEL: process.env.OMH_NEWRELIC_LOG_LEVEL,
  ENV_TAG:  process.env.OMH_ENV_TAG,
  SESSION_SECRET:  process.env.OMH_SESSION_SECRET,
  disableTracking:  process.env.OMH_DISABLE_TRACKING,
  mapHubsPro: process.env.OMH_MAPHUBS_PRO,
  fromEmail: process.env.OMH_FROM_EMAIL,
  adminEmail: process.env.OMH_ADMIN_EMAIL,
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
  },
  writeDebugData: process.env.OMH_WRITEDEBUGDATA
};
