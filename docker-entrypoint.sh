#!/bin/sh

#overwrite the client-config with live values
cat <<EOF >/app/src/clientconfig.js
var MAPHUBS_CONFIG = {
  host: "${OMH_HOST}",
  host_internal: "${OMH_HOST_INTERNAL}",
  port: ${OMH_PORT},
  internal_port: ${OMH_INTERNAL_PORT},
  https: ${OMH_HTTPS},
  productName: "${OMH_PRODUCT_NAME}",
  logo: "${OMH_LOGO}",
  logoSmall: "${OMH_LOGO_SMALL}",
  logoWidth: ${OMH_LOGO_WIDTH},
  logoHeight: ${OMH_LOGO_HEIGHT},
  logoSmallWidth: ${OMH_LOGO_WIDTH_SMALL},
  logoSmallHeight: ${OMH_LOGO_HEIGHT_SMALL},
  primaryColor: "${OMH_PRIMARY_COLOR}",
  betaText: "${OMH_BETA_TEXT}",
  twitter: "${OMH_TWITTER}",
  contactEmail: "${OMH_CONTACT_EMAIL}",
  mapHubsPro: ${OMH_MAPHUBS_PRO},
  enableComments: ${OMH_ENABLE_COMMENTS},
  CORAL_TALK_ID: "${OMH_CORAL_TALK_ID}",
  CORAL_TALK_HOST: "${OMH_CORAL_TALK_HOST}",
  tileServiceUrl: "${OMH_TILESERVICE_URL}",
  MAPBOX_ACCESS_TOKEN: "${OMH_MAPBOX_TOKEN}",
  PLANET_LABS_API_KEY: "${PLANET_LABS_API_KEY}",
  BING_KEY: "${BING_API_KEY}",
  SENTRY_DSN_PUBLIC: "${OMH_SENTRY_DSN_PUBLIC}",
  MAPZEN_API_KEY: "${OMH_MAPZEN_API_KEY}",
  theme: "${OMH_THEME}",
  themeUrl: "${OMH_THEME_URL}",
  enableUserExport: "${OMH_ENABLE_USER_EXPORT}"
};
if(typeof module !== 'undefined'){
  module.exports = MAPHUBS_CONFIG;
}

EOF

if [ -z ${OMH_REMOTE_THEME} ]
then
  cp /app/src/sass/themes/${OMH_THEME}.scss /app/src/theme.scss
else
  wget -O /app/src/theme.scss ${OMH_REMOTE_THEME}
fi

#create themed css
mkdir -p /app/css
/app/node_modules/node-sass/bin/node-sass --output-style compressed --source-map true /app/src/maphubs.scss /app/css/maphubs.css

#work-around old babel configs
touch ./node_modules/dnd-core/.babelrc
rm ./node_modules/dnd-core/.babelrc
touch ./node_modules/reactcss/.babelrc
rm ./node_modules/reactcss/.babelrc

#run any pending database migrations
node --max-old-space-size=$NODE_MEM_SIZE node_modules/knex/bin/cli.js --knexfile=src/knexfile.js migrate:latest --env production

#start server
node --max-old-space-size=$NODE_MEM_SIZE src/app.js
