#!/bin/sh

export $(cat .env.local | grep -v ^# | xargs) && \

node ./node_modules/knex/bin/cli.js --knexfile=./src/knexfile.js $@
