#!/bin/sh

export PGUSER=${DB_USER}
psql -d ${DB_DATABASE} <<- EOSQL
INSERT INTO public.client_applications (name, url, callback_url, key, secret, user_id, created_at)
VALUES ('MapHubs-iD', '${ID_URL}', '${ID_CALLBACK}', '${ID_KEY}', '${ID_SECRET}', 1, now())

EOSQL
