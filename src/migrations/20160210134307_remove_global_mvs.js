/* eslint-disable unicorn/prefer-module */

// HACK: moved the schema setup to the this first migration so we can setup new sites with just migrations

exports.up = async (knex) => {
  await knex.raw(`
  CREATE TABLE users (
    email character varying(255) NOT NULL,
    id bigint NOT NULL,
    pass_crypt character varying(255) NOT NULL,
    pass_reset varchar(255),
    creation_time timestamp without time zone NOT NULL,
    display_name character varying(255) DEFAULT ''::character varying NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    image text,
    email_valid boolean DEFAULT false NOT NULL,
    new_email character varying(255),
    creation_ip character varying(255),
    languages character varying(255),
    consider_pd boolean DEFAULT false NOT NULL,
    terms_seen boolean DEFAULT false NOT NULL
);
`)
  await knex.raw(`
CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `)
  await knex.raw(`
ALTER SEQUENCE users_id_seq OWNED BY users.id;
`)
  await knex.raw(`
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);
`)
  await knex.raw(`
ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    `)
  await knex.raw(`
CREATE UNIQUE INDEX users_display_name_idx ON users USING btree (display_name);
`)
  await knex.raw(`
CREATE UNIQUE INDEX users_email_idx ON users USING btree (email);
`)

  await knex.raw(`
CREATE SCHEMA omh;
`)
  await knex.raw(`
CREATE SCHEMA layers;
`)
  await knex.raw(`
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
`)

  await knex.raw(`
CREATE TYPE omh.group_role_enum AS ENUM (
    'Administrator',
    'Editor',
    'Member'
);
`)

  await knex.raw(`
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
`)

  await knex.raw(`
CREATE TYPE omh.data_type_enum AS ENUM (
    'point',
    'line',
    'polygon',
    'multipolygon'
);
`)

  await knex.raw(`
CREATE TYPE omh.layer_status_enum AS ENUM (
    'incomplete',
    'draft',
    'published'
);
`)

  await knex.raw(`
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
`)

  await knex.raw(`
CREATE TABLE omh.temp_data (
layer_id int PRIMARY KEY,
data json,
srid text,
uploadtmppath text,
unique_props json
);
`)

  await knex.raw(`
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
`)

  await knex.raw(`
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
`)

  await knex.raw(`
CREATE TABLE omh.images (
  image_id SERIAL PRIMARY KEY,
  image text,
  info json
);
`)

  await knex.raw(`
CREATE TABLE omh.group_images (
  group_id text,
  image_id bigint,
  PRIMARY KEY(group_id, image_id),
  CONSTRAINT groupimagesgroupfk FOREIGN KEY (group_id)
        REFERENCES omh.groups (group_id),
  CONSTRAINT groupimagesimagefk FOREIGN KEY (image_id)
        REFERENCES omh.images (image_id)
);
`)

  await knex.raw(`
INSERT INTO users (display_name, email, email_valid, pass_crypt, creation_time) VALUES ('maphubs', 'kris@maphubs.com', TRUE, 'NOT_USED', now());
`)
}

exports.down = () => {
  return Promise.resolve()
}
