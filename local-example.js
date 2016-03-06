module.exports = {
  connection: {
    url: 'postgres://user:pass@192.168.59.100:5432/maphubs'
  },
  host: 'dev.localhost',
  port: 4000,
  internal_port: 4000,
  publicFilePath: '/Users/maphubs/dev/maphubs/public/',
  tempFilePath: '/Users/maphubs/dev/maphubs/temp/',
  manetUrl: 'http://192.168.59.100:8891',
  tileServiceUrl: 'http://192.168.59.100:4001',
  MAPBOX_ACCESS_TOKEN: '1234',
  MAILGUN_API_KEY: '1234',
  LOGGLY_API_KEY: '1234',
  ENV_TAG: 'local',
  database: {
    host: '192.168.59.100',
    user: 'user',
    database: 'maphubs',
    password: 'pass'
  },
  writeDebugData: true
};
