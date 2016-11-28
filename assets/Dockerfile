FROM nginx:alpine

#MapHubs Static Assets
MAINTAINER Kristofor Carle - MapHubs <kris@maphubs.com>

RUN apk add --update git && mkdir -p /data

WORKDIR /data

#install iD
RUN git clone -b maphubs-dev --single-branch https://github.com/openmaphub/iD.git edit

COPY ./assets /data/assets
COPY ./public /data/public

COPY ./maphubsnginx_assets.template /etc/nginx/nginx.conf