\c maphubs
SET role maphubs;
--DROP SCHEMA IF EXISTS omh CASCADE;

CREATE SCHEMA omh;

CREATE SCHEMA layers;

--Groups

CREATE TABLE omh.groups (
group_id text PRIMARY KEY,
name text,
description text,
location text,
--group image
image_url text,
published boolean DEFAULT false NOT NULL,
views bigint
);

ALTER TABLE omh.groups OWNER TO maphubs;

CREATE TYPE omh.group_role_enum AS ENUM (
    'Administrator',
    'Editor',
    'Member'
);

ALTER TYPE omh.group_role_enum OWNER TO maphubs;


CREATE TABLE omh.group_memberships (
    group_membership_id SERIAL PRIMARY KEY,
    group_id text,
    user_id bigint,
    role omh.group_role_enum DEFAULT 'Member'::omh.group_role_enum NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    invite_token character varying(255),
    invite_accepted_at timestamp without time zone,
    status character varying(255),
    CONSTRAINT groupmembershipuserfk FOREIGN KEY (user_id) REFERENCES users (id)
);

ALTER TABLE omh.group_memberships OWNER TO maphubs;


--Layers

CREATE TYPE omh.data_type_enum AS ENUM (
    'point',
    'line',
    'polygon',
    'multipolygon'
);

ALTER TYPE omh.data_type_enum OWNER TO maphubs;

CREATE TYPE omh.layer_status_enum AS ENUM (
    'incomplete',
    'draft',
    'published'
);

ALTER TYPE omh.layer_status_enum OWNER TO maphubs;


CREATE TABLE omh.layers (
--basic info
layer_id SERIAL PRIMARY KEY,
name text,
description text,
data_type omh.data_type_enum DEFAULT 'point'::omh.data_type_enum NOT NULL,
status omh.layer_status_enum DEFAULT 'incomplete'::omh.layer_status_enum NOT NULL,
published boolean DEFAULT false NOT NULL,

--source
source text,
license text,

--styles
style json,
legend_html text,

--location
extent_bbox json, --TODO: also add bbox as a PostGIS geom so we can search for layers spatially
preview_position json,

--external
is_external boolean,
external_layer_type text,
external_layer_config json,

--tags/presets
presets json,

--thumbnail image
thumbnail text,

--metadata
owned_by_group_id text,
created_by_user_id bigint,
creation_time timestamp,
updated_by_user_id bigint,
last_updated timestamp,
views bigint,

CONSTRAINT layergroupfk FOREIGN KEY (owned_by_group_id) REFERENCES omh.groups (group_id),
CONSTRAINT layercreatedbyfk FOREIGN KEY (created_by_user_id) REFERENCES users (id),
CONSTRAINT layerupdatedbyfk FOREIGN KEY (updated_by_user_id) REFERENCES users (id)

);

ALTER TABLE omh.layers OWNER TO maphubs;


CREATE TABLE omh.temp_data (
layer_id int PRIMARY KEY,
data json,
srid text,
uploadtmppath text,
unique_props json
);

ALTER TABLE omh.temp_data OWNER TO maphubs;






-------
--Maps
-------
CREATE TABLE omh.maps (
map_id serial PRIMARY KEY,
title text,
position json,
style json,
screenshot text,
thumbnail text,
created_by bigint,
updated_by bigint,
created_at timestamp without time zone,
updated_at timestamp without time zone,
views bigint,
CONSTRAINT mapcreatedbyfk FOREIGN KEY (created_by) REFERENCES users (id),
CONSTRAINT mapupdatedbyfk FOREIGN KEY (updated_by) REFERENCES users (id)
);

ALTER TABLE omh.maps OWNER TO maphubs;

CREATE TABLE omh.map_layers (
map_id int,
layer_id int,
style json,
PRIMARY KEY(map_id, layer_id),
CONSTRAINT maplayersmapfk FOREIGN KEY (map_id)
      REFERENCES omh.maps (map_id),
CONSTRAINT maplayerslayerfk FOREIGN KEY (layer_id)
      REFERENCES omh.layers (layer_id)
);

ALTER TABLE omh.map_layers OWNER TO maphubs;


---------
--Images
---------
CREATE TABLE omh.images (
  image_id SERIAL PRIMARY KEY,
  image text,
  info json
);
ALTER TABLE omh.images OWNER TO maphubs;

CREATE TABLE omh.group_images (
  group_id text,
  image_id bigint,
  PRIMARY KEY(group_id, image_id),
  CONSTRAINT groupimagesgroupfk FOREIGN KEY (group_id)
        REFERENCES omh.groups (group_id),
  CONSTRAINT groupimagesimagefk FOREIGN KEY (image_id)
        REFERENCES omh.images (image_id)
);
ALTER TABLE omh.group_images OWNER TO maphubs;

