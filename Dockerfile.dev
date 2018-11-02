FROM node:10-slim

ENV DEBIAN_FRONTEND=noninteractive NODE_ENV=development DEBUG="maphubs:*,maphubs-error:*"

LABEL maintainer="Kristofor Carle <kris@maphubs.com>"

RUN apt-get update && \
    apt-get install -y wget git curl libssl-dev openssl nano unzip python build-essential g++ gdal-bin zip imagemagick libpq-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /app

WORKDIR /app

COPY package.json package-lock.json .snyk /app/
RUN npm install

COPY docker-entrypoint-dev.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD /app/docker-entrypoint.sh
