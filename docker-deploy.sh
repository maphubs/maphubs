#!/bin/sh

PACKAGE_VERSION=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g') 
docker tag quay.io/maphubs/web:latest quay.io/maphubs/web:v$PACKAGE_VERSION
docker push quay.io/maphubs/web:v$PACKAGE_VERSION