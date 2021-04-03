FROM postgis/postgis:12-3.1-alpine-arm

#MapHubs PostgreSQL DB
LABEL maintainer="Kristofor Carle<kris@maphubs.com>"

RUN mkdir -p /docker-entrypoint-initdb.d
COPY script/*.sh  /docker-entrypoint-initdb.d/
COPY script/*.sql  /docker-entrypoint-initdb.d/
COPY upgrade.sh /var/lib/postgresql/
COPY cluster_setup.sh /var/lib/postgresql/
RUN chmod +x /var/lib/postgresql/upgrade.sh && chmod +x /var/lib/postgresql/cluster_setup.sh