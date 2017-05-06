#!/bin/sh

./load-dev-env.sh

DEBUG=maphubs:* NODE_ENV=production OMH_USE_LOCAL_ASSETS=true node --max-old-space-size=2048 src/app.js
