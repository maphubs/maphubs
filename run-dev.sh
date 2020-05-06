#!/bin/sh

./load-dev-env.sh

DEBUG="maphubs:*,maphubs-error:*" NODE_OPTIONS='--inspect' node --max-old-space-size=2048 server.js