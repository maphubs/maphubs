FROM nginx:alpine

#MapHubs Static Assets
MAINTAINER Kristofor Carle - MapHubs <kris@maphubs.com>

RUN mkdir -p /data && mkdir -p /app

WORKDIR /data

COPY ./assets /data/assets
#COPY ./public /data/public
#update modified timestamps since docker doesn't copy them, needed for last-modified HTTP header
RUN find . -exec touch {} \;

COPY ./maphubsnginx_assets.template /etc/nginx/nginx.conf

COPY ./docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD /app/docker-entrypoint.sh