#!/usr/bin/env bash

#Vagrant bootstrap file (don't run this on the server)
if [`hostname` != "vagrant-ubuntu-trusty-64"]; then
  echo "only runs on Vagrant!!"
  exit 1
fi

#update
apt-get update
apt-get upgrade -y

#setup locales... not sure if this is needed
locale-gen en_US.UTF-8
update-locale LANG=en_US.UTF-8

export LANGUAGE="en_US.UTF-8"
echo 'LANGUAGE="en_US.UTF-8"' >> /etc/default/locale
echo 'LC_ALL="en_US.UTF-8"' >> /etc/default/locale

#install postgres
apt-get install -y postgresql-9.3 postgis postgresql-9.3-postgis-2.1 wget git

#setup postgres users and database
sudo -u postgres -H sh -c "createuser openmaphub -s"
sudo -u postgres -H sh -c "psql -c \"ALTER USER openmaphub WITH PASSWORD 'openmaphub';\""
sudo -u postgres -H sh -c "createuser vagrant -s"
sudo -u postgres -H sh -c "createuser root -s"
sudo -u postgres -H sh -c "createuser $1 -s"
#sudo -u postgres -H sh -c "createdb --owner vagrant moabi"
sudo -u postgres -H sh -c "psql -d openmaphub -c 'CREATE EXTENSION postgis; CREATE EXTENSION hstore;'"


# Create the apidb database owned by osm.
sudo -u postgres -H sh -c "createdb --owner openmaphub openmaphub"


# Configure the api06_test database as the OSM user.
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/apidb_0.6.sql"
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/apidb_0.6_osmosis_xid_indexing.sql"
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/apidb_0.6_admin_boundaries.sql"
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/apidb_0.6_openmaphub_updates.sql"
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/openmaphub_schema.sql"

#allow all postgres users to access
echo -e "local \t all \t all \t trust" >> /etc/postgresql/9.3/main/pg_hba.conf
echo -e "host \t all \t all \t all \t trust" >> /etc/postgresql/9.3/main/pg_hba.conf
echo -e "local \t all \t all \t peer" >> /etc/postgresql/9.3/main/pg_hba.conf
echo "listen_addresses = '*'" >> /etc/postgresql/9.3/main/postgresql.conf
service postgresql restart

#install osm2pgsql
#apt-get install -y autoconf automake libtool make g++ libboost-dev \
#  libboost-system-dev libboost-filesystem-dev libboost-thread-dev libxml2-dev \
#  libgeos-dev libgeos++-dev libpq-dev libbz2-dev libproj-dev
#git clone git://github.com/openstreetmap/osm2pgsql.git
#cd osm2pgsql/
#git checkout tags/0.84.0
#./autogen.sh
#./configure && make && make install
#cd ~vagrant

#load test data into OSM db using Osmosis
apt-get install -y openjdk-7-jre-headless
mkdir osmosis
cd osmosis
wget http://bretth.dev.openstreetmap.org/osmosis-build/osmosis-latest.tgz
tar -xvzf osmosis-latest.tgz
wget http://planet.osm.moabi.org/planet.latest.osm.gz
bin/osmosis --read-xml planet.latest.osm.gz --write-apidb host="localhost" database="openmaphub" user="openmaphub" password="openmaphub" populateCurrentTables=yes validateSchemaVersion=no
cd ~vagrant

#load openmaphub specfic test data
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/openmaphub_testdata.sql"
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/openmaphub_global_postgis_views.sql"
sudo -u postgres -H sh -c "psql -d openmaphub -f /home/vagrant/script/openmaphub_testdata_layerviews.sql"


#todo: sync test data to osm2pgsql database
#install planetdump tool
#apt-get install -y libpqxx-dev
#git clone https://github.com/openstreetmap/planetdump.git
#cd planetdump
#make planet06_pg
#cd ~vagrant
#export CONNECTION_PARAMS=dbname=api06_test
#planetdump/planet06_pg --nodes --ways --relations --changesets > dev.planet.latest.osm

#install new planetdump tool
##getting build error, think it has something to to with osmpbf libs from unbuntu 14.04 apt-get
#apt-get install -y build-essential automake autoconf \
#  libxml2-dev libboost-dev libboost-program-options-dev \
#  libboost-date-time-dev libboost-filesystem-dev \
#  libboost-thread-dev libboost-iostreams-dev \
#  libosmpbf-dev osmpbf-bin libprotobuf-dev pkg-config
#git clone https://github.com/zerebubuth/planet-dump-ng.git
#cd planet-dump-ng
#git checkout tags/v1.1.2
#./autogen.sh
#./configure
#make
#cd ~vagrant

#TODO: move this to a public repo, the auth tokens only last so long and then this doesn't work
#wget https://raw.githubusercontent.com/crowdcover/carto/master/moabi.style?token=ACUaUgGczzwCPc9_AYeCTj5bZcKwRgeeks5VsBfywA%3D%3D
#mv moabi.style?token* moabi.style
#osm2pgsql --create --hstore-all --multi-geometry --slim --cache 64 --cache-strategy sparse --database moabi --style moabi.style dev.planet.latest.osm
