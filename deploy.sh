#!/bin/sh

PACKAGE_VERSION=`node -p "require('./version.json').version"` 
git commit  -m "version $PACKAGE_VERSION"
git tag v$PACKAGE_VERSION
git push origin
git push origin v$PACKAGE_VERSION