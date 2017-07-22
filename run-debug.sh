#!/bin/sh

export $(cat env/dev/db.env | grep -v ^# | xargs) && \
export $(cat env/dev/web.env | grep -v ^# | xargs) && \
export $(cat env/dev/host.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/db-pass.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/web-secret.env | grep -v ^# | xargs) && \
NODE_ENV=production DEBUG="maphubs:*,maphubs-error:*" node --debug --max-old-space-size=2048 -r babel-register src/app.js
