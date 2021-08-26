#!/bin/bash

./load-dev-env.sh

DEBUG="maphubs:*,maphubs-error:*" yarn run ts-node --project tsconfig.server.json ./server.ts