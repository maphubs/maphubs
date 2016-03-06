#!/bin/sh
docker stop maphubs-db
docker rm maphubs-db
docker build --tag="maphubs-db" .
docker run --name maphubs-db -p 5432:5432 -d \
-e POSTGRES_PASSWORD=maphubs \
-e DB_DATABASE=maphubs \
-e DB_USER=maphubs \
-e DB_PASS=maphubs \
-e ID_URL=http://maphubs.com/edit \
-e ID_CALLBACK=http://maphubs.com/edit/land.html \
-e ID_KEY=abc123 \
-e ID_SECRET=ssh-secret \
maphubs-db


#docker run -it --link maphubs-db:postgres --rm postgres sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" -p "$POSTGRES_PORT_5432_TCP_PORT" -U postgres'
