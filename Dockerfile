FROM ubuntu:16.04

ENV DEBIAN_FRONTEND=noninteractive NODE_ENV=production

#MapHubs Web Server
MAINTAINER Kristofor Carle - MapHubs <kris@maphubs.com>

RUN apt-get update && \
    apt-get install -y wget git curl libssl-dev openssl nano unzip python build-essential g++ gdal-bin zip imagemagick libpq-dev && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash && \
    apt-get install -y nodejs && \
    npm install -g yarn@0.16.1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /app

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install --production --pure-lockfile

COPY ./src /app/src
COPY .babelrc /app/.babelrc
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

#create temp folders
RUN mkdir -p css && mkdir -p /app/temp/uploads

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000

CMD /app/docker-entrypoint.sh
