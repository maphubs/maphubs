cat env/dev/db.env > .env
cat env/dev/web.env >> .env
cat env/dev/host.env >> .env
cat env/dev/id-config.env >> .env
cat env/dev/secret/db-pass.env >> .env
cat env/dev/secret/web-secret.env >> .env
cat env/dev/secret/id-secret.env >> .env

source .env
export $(cut -d= -f1 .env)

#overwrite the client-config with live values
cat <<EOF >./src/clientconfig.js
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
  MAPZEN_API_KEY: "${OMH_MAPZEN_API_KEY}",
  PLANET_LABS_API_KEY: "${PLANET_LABS_API_KEY}",
  BING_KEY:  "${BING_API_KEY}",
  SENTRY_DSN_PUBLIC:  "${OMH_SENTRY_DSN_PUBLIC}",
  theme: "${OMH_THEME}",
};
if(typeof module !== 'undefined'){
  module.exports = MAPHUBS_CONFIG;
}

EOF

cp ./src/sass/${OMH_THEME}.scss ./src/theme.scss

#work-around old babel config included in dnd-core
touch ./node_modules/dnd-core/.babelrc
rm ./node_modules/dnd-core/.babelrc