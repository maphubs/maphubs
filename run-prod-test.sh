#!/bin/sh

./load-dev-env.sh

DEBUG="maphubs:*,maphubs-error:*" NODE_ENV=production ASSET_CDN_PREFIX= OMH_USE_LOCAL_ASSETS=true node --max-old-space-size=2048 server.js
