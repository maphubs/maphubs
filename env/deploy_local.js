//Development
module.exports = {
  connection: {
    url: 'postgres://' + process.env.DB_USER + ':'+ process.env.DB_PASS +'@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE
  },
  host: process.env.OMH_HOST ? process.env.OMH_HOST : process.env.TUTUM_SERVICE_FQDN,
  port: process.env.OMH_PORT,
  internal_port: process.env.OMH_INTERNAL_PORT,
  publicFilePath: '/home/maphubs/app/public/',
  tempFilePath: '/home/maphubs/app/temp/',
  manetUrl: process.env.OMH_MANET_URL,
  tileServiceUrl: process.env.OMH_TILESERVICE_URL,
  MAPBOX_ACCESS_TOKEN: process.env.OMH_MAPBOX_TOKEN,
  MAILGUN_API_KEY: process.env.OMH_MAILGUN_API_KEY,
  LOGGLY_API_KEY: process.env.OMH_LOGGLY_API_KEY,
  ENV_TAG:  process.env.OMH_ENV_TAG,
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
  },
  writeDebugData: process.env.OMH_WRITEDEBUGDATA
};
