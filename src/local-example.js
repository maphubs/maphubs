module.exports = {
  connection: {
    url: 'postgres://user:pass@localhost:5432/maphubs'
  },
  host: 'localhost',
  port: 4000,
  internal_port: 4000,
  publicFilePath: '/Users/maphubs/dev/maphubs/public/',
  tempFilePath: '/Users/maphubs/dev/maphubs/temp/',
  manetUrl: 'http://localhost:8891',
  tileServiceUrl: 'http://localhost:4001',
  MAPBOX_ACCESS_TOKEN: '1234',
  MAILGUN_API_KEY: '1234',
  LOGGLY_API_KEY: '1234',
  MAILCHIMP_LIST_ID: '1234',
  MAILCHIMP_API_KEY: '1234',
  ENV_TAG: 'local',
  SESSION_SECRET: 'secret',
  database: {
    host: 'localhost',
    user: 'user',
    database: 'maphubs',
    password: 'pass'
  },
  writeDebugData: true
};
