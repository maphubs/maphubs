# MapHubs

MapHubs is a collaborative platform for sharing mapping data, organizing data into hubs, and telling stories with maps.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmaphubs%2Fmaphubs.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmaphubs%2Fmaphubs?ref=badge_shield)

## Status

Web: [![Docker Repository on Quay](https://quay.io/repository/maphubs/web/status "Docker Repository on Quay")](https://quay.io/repository/maphubs/web)

Assets: [![Docker Repository on Quay](https://quay.io/repository/maphubs/assets/status "Docker Repository on Quay")](https://quay.io/repository/maphubs/assets)

Database: [![Docker Repository on Quay](https://quay.io/repository/maphubs/db/status "Docker Repository on Quay")](https://quay.io/repository/maphubs/db)

## Running MapHubs

MapHubs runs as a stack of Docker containers (see list below) using either docker-compose or [Docker Cloud](cloud.docker.com)

## Development

### Installing dependencies

```sh
git clone git@github.com:maphubs/maphubs.git
cd maphubs
yarn install
```

### Local configuration

Before running maphubs locally, you will need to update the environment config variables

- In env/dev/secret copy each of the sample files

MapHubs is made of multiple components: a database, the web application (this project), a vector tile server, and a screenshot service. The easiest way to run everything is with Docker.

#### Database

The `db-server` directory contains instructions on running your own postgresql database with the appropriate table schema using Docker.

#### Vector Tile Server

[https://github.com/maphubs/maphubs-tileserver](https://github.com/maphubs/maphubs-tileserver)

#### Screenshot Service

[https://github.com/openmaphub/manet-dockerfile](https://github.com/openmaphub/manet-dockerfile)

### Running

To run the server, use the following command:

```sh
npm start
```

### License

GPL-v2 see LICENSE.txt

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmaphubs%2Fmaphubs.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmaphubs%2Fmaphubs?ref=badge_large)

Previous versions of this code (< v0.8.x) contained a fork of Macrocosm [https://github.com/developmentseed/macrocosm](https://github.com/developmentseed/macrocosm) licensed under GPL-v2
