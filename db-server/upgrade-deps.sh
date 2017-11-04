#!/bin/sh

#first backup: both the data volume AND pg_dump

#next run mdillon/postgis:9.5-alpine
#docker run --rm -p 5432:5432 -v maphubs-db-data:/var/lib/postgresql/data mdillon/postgis:9.5-alpine

#run console then drop extension postgis cascade; create extension postgis;

#run mdillon/postgis:9.6-alpine
#docker run --rm -it -v maphubs-db-data:/var/lib/postgresql/data mdillon/postgis:9.6-alpine bash


  export PGIS_VERSION=2.3.2
  # install the old server 
  apk add --update alpine-sdk ca-certificates openssl tar bison coreutils dpkg-dev dpkg flex gcc libc-dev libedit-dev libxml2-dev libxslt-dev make openssl-dev perl perl-ipc-run util-linux-dev zlib-dev -y; curl -s https://ftp.postgresql.org/pub/source/v9.5.9/postgresql-9.5.9.tar.bz2 | tar xvj -C /var/lib/postgresql/; cd /var/lib/postgresql/postgresql-9.5.9/; ./configure --prefix=/pg9.5; make; make install

  #install postgis deps
  apk add --no-cache --virtual .build-deps-testing \
        --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing \
        gdal-dev \
        geos-dev \
        proj4-dev

# reinstall postgis for 9.5
  wget http://download.osgeo.org/postgis/source/postgis-$PGIS_VERSION.tar.gz \
  && tar xvzf postgis-$PGIS_VERSION.tar.gz \
  && rm postgis-$PGIS_VERSION.tar.gz \
  && cd postgis-$PGIS_VERSION \
  && ./configure --with-pgconfig=/pg9.5/bin/pg_config \
  && make \
  && make install

  # update the data 
  su postgres -c "initdb --username=postgres /var/lib/postgresql/data2"
  chown -R postgres:postgres /var/lib/postgresql/data
  su postgres -c "chmod 700 /var/lib/postgresql/data" 
  su postgres -c "cd ~ && pg_upgrade -b /pg9.5/bin/ -B /usr/local/bin/ -d /var/lib/postgresql/data/ -D /var/lib/postgresql/data2"
  su postgres -c "cp /var/lib/postgresql/data/pg_hba.conf /var/lib/postgresql/data2/pg_hba.conf"
  su postgres -c "rm -rf /var/lib/postgresql/data/*"
  su postgres -c "mv /var/lib/postgresql/data2/* /var/lib/postgresql/data/"