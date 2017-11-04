FROM mdillon/postgis:9.6-alpine

LABEL maintainer="Kristofor Carle - Moabi <kris@moabi.org>"

ENV PGIS_VERSION=2.3.2

RUN apk add --update alpine-sdk ca-certificates openssl tar bison coreutils dpkg-dev dpkg flex gcc libc-dev libedit-dev libxml2-dev libxslt-dev make openssl-dev perl perl-ipc-run util-linux-dev zlib-dev -y; curl -s https://ftp.postgresql.org/pub/source/v9.5.9/postgresql-9.5.9.tar.bz2 | tar xvj -C /var/lib/postgresql/; cd /var/lib/postgresql/postgresql-9.5.9/; ./configure --prefix=/pg9.5; make; make install

#install postgis deps
RUN apk add --no-cache --virtual .build-deps-testing \
        --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing \
        gdal-dev \
        geos-dev \
        proj4-dev

# reinstall postgis for 9.5
RUN wget http://download.osgeo.org/postgis/source/postgis-$PGIS_VERSION.tar.gz \
  && tar xvzf postgis-$PGIS_VERSION.tar.gz \
  && rm postgis-$PGIS_VERSION.tar.gz \
  && cd postgis-$PGIS_VERSION \
  && ./configure --with-pgconfig=/pg9.5/bin/pg_config \
  && make \
  && make install

COPY upgrade.sh /var/lib/postgresql/
COPY cluster_setup.sh /var/lib/postgresql/
RUN chmod +x /var/lib/postgresql/upgrade.sh && chmod +x /var/lib/postgresql/cluster_setup.sh

#keep it running so we can connect a shell to manually execute the upgrade
CMD ["tail", "-f", "/var/lib/postgresql/data/postgresql.conf"]