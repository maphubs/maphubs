#!/bin/sh

./load-dev-env.sh

DEBUG=maphubs:* node --max-old-space-size=2048 src/app.js
