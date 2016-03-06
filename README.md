# MapHubs

MapHubs is a collaborative platform for sharing mapping data, organizing data into hubs, and telling stories with maps.

## Contributing

### Installing dependencies
```sh
git clone git@github.com:maphubs/maphubs.git
cd maphubs
npm install
```

### Local configuration

Before running the server, you will need to add `local.js` and `clientconfig.js` in your root directory (see `local-example.js` and `clientconfig-example.js`).

MapHubs is made of multiple components: a database, the web application (this project), a vector tile server, and a screenshot service. The easiest way to run everything is with Docker.

#### Database

The `db-server` directory contains instructions on running your own postgresql database with the appropriate table schema using Docker. For Mac OS X users you might need [docker-machine](https://github.com/docker/machine)

#### Vector Tile Server
https://github.com/maphubs/maphubs-tileserver

#### Screenshot Service
https://github.com/openmaphub/manet-dockerfile

### Running

To run the server, use the following command:

```sh
npm start
```


### License

GPL-v2 see LICENSE.txt

This project contains a fork of Macrocosm https://github.com/developmentseed/macrocosm licensed under GPL-v2
