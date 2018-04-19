FROM node:8

LABEL maintainer="Kristofor Carle <kris@maphubs.com>"

ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y libssl-dev openssl unzip build-essential gdal-bin zip && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /app

WORKDIR /app

COPY package.json yarn.lock .snyk /app/

RUN yarn install --production --pure-lockfile && \
    npm install -g snyk && \
    yarn run snyk-protect && \
    npm uninstall -g snyk && \
    yarn cache clean
    
COPY ./src /app/src
COPY ./pages /app/pages
COPY ./.next /app/.next
COPY .babelrc next.config.js server.js server.es6.js docker-entrypoint.sh /app/

RUN chmod +x /app/docker-entrypoint.sh && \
    mkdir -p css && mkdir -p /app/temp/uploads

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000

CMD /app/docker-entrypoint.sh
