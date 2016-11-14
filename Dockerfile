FROM ubuntu:16.04

ENV DEBIAN_FRONTEND=noninteractive NODE_ENV=production

#MapHubs Web Server
MAINTAINER Kristofor Carle - MapHubs <kris@maphubs.com>

RUN apt-get update && \
    apt-get install -y wget git curl libssl-dev openssl nano unzip python build-essential g++ gdal-bin zip imagemagick libpq-dev && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /app

WORKDIR /app

COPY deploy/package.json deploy/yarn.lock /app/
RUN yarn install --production --pure-lockfile

#install iD
RUN git clone -b maphubs-dev --single-branch https://github.com/openmaphub/iD.git

COPY ./src /app/src
COPY ./assets /app/assets
COPY .babelrc /app/.babelrc
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

#copy environment specific config file
COPY env/deploy_local.js  /app/src/local.js

#create temp folders
RUN mkdir -p public && mkdir -p css && mkdir -p /app/temp/uploads

#rebuild client files
RUN node /app/node_modules/webpack/bin/webpack.js --config /app/src/webpack.config.min.js

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000

CMD /app/docker-entrypoint.sh
