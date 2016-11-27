#!/bin/sh

export $(cat env/dev/db.env | grep -v ^# | xargs) && \
export $(cat env/dev/web.env | grep -v ^# | xargs) && \
export $(cat env/dev/host.env | grep -v ^# | xargs) && \
export $(cat env/dev/id-config.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/db-pass.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/web-secret.env | grep -v ^# | xargs) && \
export $(cat env/dev/secret/id-secret.env | grep -v ^# | xargs) && \
DEBUG=maphubs:* node --max-old-space-size=2048 src/app.js
