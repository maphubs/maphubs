#!/bin/sh

export $(cat env/dev/db.env | grep -v ^# | xargs) && \
export $(cat env/dev/web.env | grep -v ^# | xargs) && \
export $(cat env/dev/host.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/db-pass.env | grep -v ^# | xargs) && \
cd ./src &&node ../node_modules/knex/bin/cli.js --knexfile=./knexfile.js $@
