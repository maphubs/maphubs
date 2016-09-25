#!/bin/sh

#overwrite the client-config with live values
cat <<EOF >/app/clientconfig.js
module.exports = {
  host: "${OMH_HOST}",
  port: ${OMH_PORT},
  https: "${OMH_HTTPS}" == "true",
  productName: "${OMH_PRODUCT_NAME}",
  logo: "${OMH_LOGO}",
  betaText: "${OMH_BETA_TEXT}",
  twitter: "${OMH_TWITTER}",
  contactEmail: "${OMH_CONTACT_EMAIL}",
  mapHubsPro: "${OMH_MAPHUBS_PRO}" == "true",
  tileServiceUrl: "${OMH_TILESERVICE_URL}",
  MAPBOX_ACCESS_TOKEN: "${OMH_MAPBOX_TOKEN}"
};
EOF

cp /app/css/${OMH_THEME}.scss /app/theme.scss

#write iD config
cat <<EOF >/app/iD/js/config.js
var OMH_CONFIG = {
  AUTH_URL: "${ID_AUTH_URL}",
  OAUTH_CONSUMER_KEY: "${ID_KEY}",
  OAUTH_SECRET: "${ID_SECRET}"
};
EOF

#rebuild client files
node node_modules/webpack/bin/webpack.js --config webpack.config.min.js

#run any pending database migrations
node node_modules/knex/lib/bin/cli.js migrate:latest --env production

#start server
pm2 start app.js --name maphubs --node-args="--max-old-space-size=$NODE_MEM_SIZE" --no-daemon
