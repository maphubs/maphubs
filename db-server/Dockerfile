FROM mdillon/postgis:9.6-alpine

#MapHubs PostgreSQL DB
LABEL maintainer="Kristofor Carle<kris@maphubs.com>"

COPY script/*.sh  /docker-entrypoint-initdb.d/
COPY script/*.sql  /docker-entrypoint-initdb.d/
COPY upgrade.sh /var/lib/postgresql/
COPY cluster_setup.sh /var/lib/postgresql/
RUN chmod +x /var/lib/postgresql/upgrade.sh && chmod +x /var/lib/postgresql/cluster_setup.sh