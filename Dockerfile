FROM ubuntu:trusty

ENV DEBIAN_FRONTEND noninteractive

#MapHubs Web Server
MAINTAINER Kristofor Carle - MapHubs <kris@maphubs.com>

#update and install basics
RUN apt-get update && apt-get install -y wget git curl libssl-dev openssl nano unzip python build-essential g++ gdal-bin zip imagemagick libpq-dev

#install node, npm, pm2
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash
RUN apt-get install -y nodejs
RUN npm install -g npm@3.9.2 && npm install pm2 -g

#create non-root user
RUN useradd -s /bin/bash -m -d /home/maphubs -c "maphubs" maphubs && chown -R maphubs:maphubs /home/maphubs

#switch over and do everything else as the non-priledged user
USER maphubs

RUN mkdir -p /home/maphubs/app
WORKDIR /home/maphubs/app

COPY package.json /home/maphubs/app/package.json
COPY npm-shrinkwrap.json /home/maphubs/app/npm-shrinkwrap.json
RUN npm install

#install iD
RUN cd /home/maphubs/ && git clone -b maphubs-dev --single-branch https://github.com/openmaphub/iD.git

user root
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
COPY . /home/maphubs/app
RUN chown -R maphubs:maphubs /home/maphubs/app
RUN chmod +x /home/maphubs/app/docker-entrypoint.sh

#copy environment specific config file
COPY env/deploy_local.js  /home/maphubs/app/local.js
RUN chown maphubs:maphubs /home/maphubs/app/local.js

#VOLUME ["/var/log/maphubs"]
#RUN chown -R maphubs:maphubs /var/log/maphubs

#create temp folders
USER maphubs
RUN mkdir -p public && mkdir -p temp/uploads

EXPOSE 4000
ENV NODE_ENV production

ENV DEBUG *,-express:*,-babel,-oauth2orize,-morgan,-express-session,-tessera,-body-parser:*,-compression,-pool2,-knex:*,-pm2:*
CMD /home/maphubs/app/docker-entrypoint.sh
