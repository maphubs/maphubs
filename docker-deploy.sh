#!/bin/sh

PACKAGE_VERSION=`node -p "require('./version.json').version"` 
docker tag quay.io/maphubs/web:latest quay.io/maphubs/web:v$PACKAGE_VERSION
docker push quay.io/maphubs/web:v$PACKAGE_VERSION