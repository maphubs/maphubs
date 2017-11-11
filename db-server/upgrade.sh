#!/bin/sh

su postgres -c "initdb --username=postgres /var/lib/postgresql/data2"

chown -R postgres:postgres /var/lib/postgresql/data

su postgres -c "chmod 700 /var/lib/postgresql/data" 

su postgres -c "cd ~ && pg_upgrade -b /pg9.5/bin/ -B /usr/local/bin/ -d /var/lib/postgresql/data/ -D /var/lib/postgresql/data2"

su postgres -c "cp /var/lib/postgresql/data/pg_hba.conf /var/lib/postgresql/data2/pg_hba.conf"

su postgres -c "rm -rf /var/lib/postgresql/data/*"

su postgres -c "mv /var/lib/postgresql/data2/* /var/lib/postgresql/data/"