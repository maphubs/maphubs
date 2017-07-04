#!/bin/sh

./load-dev-env.sh

DEBUG="maphubs:*,maphubs-error:*" node --max-old-space-size=2048 src/app.js