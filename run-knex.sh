#!/bin/sh

export $(cat env/dev/db.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/db-pass.env | grep -v ^# | xargs) && \
node node_modules/knex/bin/cli.js --knexfile=src/knexfile.js $@
