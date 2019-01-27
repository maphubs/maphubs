FROM node:10 as base

LABEL maintainer="Kristofor Carle <kris@maphubs.com>"

ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y libssl-dev openssl unzip build-essential gdal-bin zip && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /app

WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json .snyk /app/

RUN npm config set '@bit:registry' https://node.bitsrc.io && \
    npm install --production && \
    npm install -g snyk && \
    npm run snyk-protect

FROM base AS release 
COPY --from=dependencies /app /app  
COPY ./src /app/src
COPY ./pages /app/pages
COPY ./.next /app/.next
COPY .babelrc next.config.js server.js server.es6.js docker-entrypoint.sh version.json /app/

RUN chmod +x /app/docker-entrypoint.sh && \
    mkdir -p css && mkdir -p /app/temp/uploads

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000

CMD /app/docker-entrypoint.sh
