FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

#MapHubs Web Server
MAINTAINER Kristofor Carle - MapHubs <kris@maphubs.com>

#update and install basics
RUN apt-get update && \
apt-get install -y wget git curl libssl-dev openssl nano unzip python build-essential g++ gdal-bin zip imagemagick libpq-dev && \
apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#install node, npm, pm2
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash
RUN apt-get install -y nodejs && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#don't upgrade npm until this is resolved https://github.com/npm/npm/issues/9863
#RUN npm install -g npm@3.10.5 && npm install pm2 -g
RUN npm install pm2 -g

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/package.json
COPY npm-shrinkwrap.json /app/npm-shrinkwrap.json
RUN npm install

#install iD
RUN git clone -b maphubs-dev --single-branch https://github.com/openmaphub/iD.git

COPY . /app
RUN chmod +x /app/docker-entrypoint.sh

#copy environment specific config file
COPY env/deploy_local.js  /app/local.js

#create temp folders
RUN mkdir -p public && mkdir -p temp/uploads  && mkdir -p temp/logs

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000
ENV NODE_ENV production

ENV DEBUG *,-express:*,-babel,-oauth2orize,-morgan,-express-session,-tessera,-body-parser:*,-compression,-pool2,-knex:*,-pm2:*
CMD /app/docker-entrypoint.sh
