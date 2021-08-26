#!/bin/sh
NODE_ENV=production
PACKAGE_VERSION=`node -p "require('./version.json').version"`
ASSET_CDN_PREFIX=https://cdn-maphubs.b-cdn.net/maphubs

#next.js build and export assets
node --max_old_space_size=8124 node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next export -o .next-export

#docker build
docker build . --compress -t quay.io/maphubs/web:v$PACKAGE_VERSION

#commit version tag
git add version.json
git add .next/BUILD_ID
git commit  -m "version $PACKAGE_VERSION"
git tag v$PACKAGE_VERSION
git push origin
git push origin v$PACKAGE_VERSION

#sync assets to CDN
aws s3 sync .next-export/ s3://maphubs-cdn/maphubs --acl public-read

#push Docker image to repo
docker push quay.io/maphubs/web:v$PACKAGE_VERSION

#update changelog
#npm run changelog
