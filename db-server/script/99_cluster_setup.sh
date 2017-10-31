#!/bin/bash

if [ ! -f "$PGDATA/.docker_pgconfig" ]; then
	mkdir -p $PGDATA/archive
	chown postgres. $PGDATA/archive -R

	# Shut down the pgsql server
	pg_ctl stop -w -D $PGDATA

	## Patch postgresql.conf ##
	# Write ahead log
	sed -i "s/#wal_level = minimal/wal_level = hot_standby/g" $PGDATA/postgresql.conf
	sed -i "s/#max_wal_senders = 0/max_wal_senders = 15/g" $PGDATA/postgresql.conf
	sed -i "s/#wal_keep_segments = 0/wal_keep_segments = 8/g" $PGDATA/postgresql.conf

	# Standby settings
	sed -i "s/#hot_standby = off/hot_standby = on/g" $PGDATA/postgresql.conf

	# Archive settings (primary only)
	if [ "$PRIMARY" ]; then
		echo -e "local all all trust\nhost all all all trust\nhost replication all all trust" >  $PGDATA/pg_hba.conf
		sed -i "s/#archive_mode = off/archive_mode = on/g" $PGDATA/postgresql.conf
		sed -i "s|#archive_command = ''|archive_command = 'cp -i %p $PGDATA/archive/%f'|g" $PGDATA/postgresql.conf
	fi
	
	# Replica only
	if [ ! "$PRIMARY" ]; then
		rm -fr $PGDATA/*
		pg_basebackup -D $PGDATA -vPwR --xlog-method=stream --dbname="host=db user=postgres"
		echo "trigger_file = '$PGDATA/standby.trigger'" >> $PGDATA/recovery.conf
		echo "restore_command = 'cp $PGDATA/archive/%f %p'" >> $PGDATA/recovery.conf
	fi

	touch $PGDATA/.docker_pgconfig

	# Restart postgres
	pg_ctl start -w -D $PGDATA
fi