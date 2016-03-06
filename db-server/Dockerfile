FROM mdillon/postgis:9.5

#MapHubs PostgreSQL DB
MAINTAINER Kristofor Carle - Moabi <kris@moabi.org>

COPY script/*.sh  /docker-entrypoint-initdb.d/
COPY script/*.sql  /docker-entrypoint-initdb.d/
