FROM mdillon/postgis:9.6-alpine

#MapHubs PostgreSQL DB
MAINTAINER Kristofor Carle - Moabi <kris@moabi.org>

COPY script/*.sh  /docker-entrypoint-initdb.d/
COPY script/*.sql  /docker-entrypoint-initdb.d/
COPY upgrade.sh /var/lib/postgresql/
COPY cluster_setup.sh /var/lib/postgresql/
RUN chmod +x /var/lib/postgresql/upgrade.sh && chmod +x /var/lib/postgresql/cluster_setup.sh