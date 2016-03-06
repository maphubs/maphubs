#!/bin/sh

#docker-machine create --driver virtualbox --virtualbox-hostonly-cidr "192.168.59.1/24" default
docker stop maphubs-web
docker rm maphubs-web
docker build --tag="maphubs-web" .

docker run --name maphubs-web -p 4000:4000 -d \
-e OMH_HOST=dev.docker \
-e OMH_PORT=4000 \
-e OMH_INTERNAL_PORT=4000 \
-e OMH_HTTPS=false \
-e DB_USER=user \
-e DB_PASS=pass \
-e DB_HOST=192.168.59.100 \
-e DB_PORT=5432 \
-e DB_DATABASE=maphubs \
-e OMH_MANET_URL=http://192.168.59.100:8891 \
-e OMH_TILESERVICE_URL=http://192.168.59.100:4001 \
-e OMH_MAPBOX_TOKEN=1234 \
-e OMH_MAILGUN_API_KEY=1234 \
-e OMH_LOGGLY_API_KEY=1234 \
-e ENV_TAG=local \
-e OMH_WRITEDEBUGDATA=false \
-e ID_AUTH_URL=http://192.168.59.100:4000 \
-e ID_KEY=abc123 \
-e ID_SECRET=ssh-secret \
maphubs-web
