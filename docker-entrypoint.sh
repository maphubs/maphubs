#!/bin/sh

#overwrite the client-config with live values
cat <<EOF >/home/maphubs/app/clientconfig.js
module.exports = {
  host: "${OMH_HOST}",
  port: ${OMH_PORT},
  https: ${OMH_HTTPS},
  tileServiceUrl: "${OMH_TILESERVICE_URL}",
  MAPBOX_ACCESS_TOKEN: "${OMH_MAPBOX_TOKEN}"
};
EOF

#write iD config
cat <<EOF >/home/maphubs/iD/js/config.js
var OMH_CONFIG = {
  AUTH_URL: "${ID_AUTH_URL}",
  OAUTH_CONSUMER_KEY: "${ID_KEY}",
  OAUTH_SECRET: "${ID_SECRET}"
};
EOF

#rebuild client files
PROD_DEV=1 node node_modules/webpack/bin/webpack.js

#run any pending database migrations
node node_modules/knex/lib/bin/cli.js migrate:latest --env production

#start server
pm2 start app.js --name maphubs --no-daemon
