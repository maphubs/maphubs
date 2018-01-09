FROM ubuntu:16.04

LABEL maintainer="Kristofor Carle <kris@maphubs.com>"

ENV DEBIAN_FRONTEND=noninteractive NODE_ENV=production

RUN apt-get update && \
    apt-get install -y wget git curl libssl-dev openssl nano unzip python build-essential g++ gdal-bin zip imagemagick libpq-dev && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash && \
    apt-get install -y nodejs && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    mkdir -p /app

WORKDIR /app

COPY package.json yarn.lock .snyk /app/

RUN yarn install --production --pure-lockfile && \
    npm install -g snyk && \
    yarn run snyk-protect && \
    npm uninstall -g snyk

COPY ./src /app/src
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && \
    mkdir -p css && mkdir -p /app/temp/uploads

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000

CMD /app/docker-entrypoint.sh
