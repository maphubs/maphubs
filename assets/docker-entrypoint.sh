#!/bin/sh

#write iD config
cat <<EOF >/data/edit/js/config.js
var OMH_CONFIG = {
  AUTH_URL: "${ID_AUTH_URL}",
  OAUTH_CONSUMER_KEY: "${ID_KEY}",
  OAUTH_SECRET: "${ID_SECRET}"
};
EOF

#start nginx
nginx -g 'daemon off;'
