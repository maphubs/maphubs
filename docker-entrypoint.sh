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
  tileServiceUrl: "${OMH_TILESERVICE_URL}",
  MAPBOX_ACCESS_TOKEN: "${OMH_MAPBOX_TOKEN}",
  PLANET_LABS_API_KEY: "${PLANET_LABS_API_KEY}",
  BING_KEY:  "${BING_API_KEY}",
  theme: "${OMH_THEME}",
  homepageProLinks: "${OMH_HOMEPAGE_PRO_LINKS}",
  homepageSlides: "${OMH_HOMEPAGE_SLIDES}",
  homepageMapHubId: "${OMH_HOMEPAGE_MAP_HUB_ID}",
  homepageMailingList: "${OMH_HOMEPAGE_MAILINGLIST}",
  mapHubsProDemo: "${OMH_MAPHUBS_PRO_DEMO}"
};
if(typeof module !== 'undefined'){
  module.exports = MAPHUBS_CONFIG;
}

EOF

cp /app/src/sass/${OMH_THEME}.scss /app/src/theme.scss
mkdir -p /app/css

#work-around old babel config included in dnd-core
rm ./node_modules/dnd-core/.babelrc

#run any pending database migrations
node node_modules/knex/bin/cli.js --knexfile=src/knexfile.js migrate:latest --env production

#start server
node --max-old-space-size=$NODE_MEM_SIZE src/app.js
