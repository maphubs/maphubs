var log = require('../services/log');

exports.up = function(knex, Promise) {
  var commands = [];

  //don't need to drop on newer DB installs
  //commands.push(`DROP MATERIALIZED VIEW postgis_polygon_geom CASCADE;`);
  //commands.push(`DROP MATERIALIZED VIEW postgis_way_geom CASCADE;`);
  //commands.push(`DROP MATERIALIZED VIEW postgis_node_geom CASCADE;`);
  commands.push(`
  CREATE or replace VIEW postgis_node_geom AS
  SELECT
  id AS node_id,
  ST_Transform(ST_SetSRID(ST_MakePoint(longitude::float/10000000,latitude::float/10000000), 4326), 900913)::geometry(POINT,900913) AS geom
  FROM current_nodes
  ;
  `);

  commands.push(`
  CREATE or replace VIEW planet_osm_nodes AS
  SELECT
  a.id,
  a.latitude as lat,
  a.longitude as lon,
  CASE WHEN array_agg(b.k::text) = '{NULL}'
  THEN null
  ELSE hstore(array_agg(b.k::text),array_agg(b.v::text))
  END AS tags
  FROM current_nodes a
  LEFT JOIN current_node_tags b ON a.id = b.node_id
  group by a.id
  ;
  `);

  commands.push(`
  CREATE or replace VIEW postgis_way_geom AS
  SELECT
  a.id AS way_id,
  ST_MakeLine(c.geom ORDER BY b.sequence_id)::geometry(LINESTRING,900913) AS geom,
  array_agg(b.node_id ORDER BY b.sequence_id) as nodes
  FROM current_ways a
  LEFT JOIN current_way_nodes b ON a.id = b.way_id
  LEFT JOIN postgis_node_geom c ON b.node_id = c.node_id
  GROUP BY a.id
  ;
  `);

  commands.push(`
  CREATE OR REPLACE VIEW planet_osm_ways AS
  SELECT
  a.way_id as id,
  a.nodes,
  CASE WHEN count(d.k) = 0
  THEN NULL
  ELSE hstore(array_agg(d.k::text),array_agg(d.v::text))
  END AS tags,
  FALSE::BOOLEAN as pending,
  a.geom::geometry(LINESTRING,900913) --also adding the geom (not included in osm2pgsql)
  FROM postgis_way_geom a
  LEFT JOIN current_way_tags d ON a.way_id = d.way_id
  GROUP BY a.way_id, a.nodes, a.geom
  ;
  `);

  commands.push(`
  CREATE OR REPLACE VIEW planet_osm_line AS
  SELECT
  id as osm_id,
  geom::geometry(LINESTRING,900913),
  tags
  FROM planet_osm_ways
  WHERE ((tags->'area') NOT IN ('yes', 'true') OR (tags->'area') IS NULL)
  	AND id NOT IN (
      SELECT DISTINCT current_relations.id FROM current_relation_tags
      LEFT JOIN current_relations ON current_relation_tags.relation_id = current_relations.id
      LEFT JOIN current_relation_members  ON current_relation_members.relation_id = current_relations.id
      WHERE k = 'type' AND v = 'multipolygon' AND member_type = 'Way'
    )
  ;
  `);

  commands.push(`
  CREATE OR REPLACE VIEW planet_osm_rels AS
  SELECT
  a.id,
  array_agg(b.member_id ORDER BY b.sequence_id) as parts,
  array_agg(b.member_type::text ORDER BY b.sequence_id)as types,
  array_agg(b.member_role::text ORDER BY b.sequence_id) as roles,
  --hstore(, array_agg(b.member_role::text ORDER BY b.sequence_id)) as members_hstore,
  hstore(array_agg(c.k::text),array_agg(c.v::text)) AS tags,
  FALSE::BOOLEAN as pending
  FROM current_relations a
  LEFT JOIN current_relation_members b ON a.id = b.relation_id
  LEFT JOIN current_relation_tags c ON a.id = c.relation_id
  WHERE b.relation_id IS NOT NULL --ignore empty relations, these are just bad data?
  GROUP BY a.id
  ;
  `);

  commands.push(`
  CREATE OR REPLACE VIEW relation_member_counts AS
  SELECT relation_id, member_role, count(member_role)
  FROM current_relation_members
  WHERE member_type = 'Way'
  group by relation_id, member_role
  ;
  `);

  commands.push(`
  CREATE OR REPLACE VIEW postgis_polygon_geom AS
  --polygons from ways
  SELECT
  id AS osm_id,
  ST_Multi(ST_MakePolygon(ST_AddPoint(geom, ST_StartPoint(geom))))::geometry(MULTIPOLYGON,900913) AS geom,
  'way'::text as osm_source
  FROM planet_osm_ways
  WHERE (((tags->'area') = 'yes') OR ((tags->'area') = 'true'))

  UNION
  --Multipolygons
  SELECT
  a.id as osm_id,
  ST_Multi(ST_Union(c.geom ORDER BY b.sequence_id))::geometry(MULTIPOLYGON,900913) as geom,
  'rel'::text as osm_source
  FROM planet_osm_rels a
  LEFT JOIN current_relation_members b ON a.id = b.relation_id
  LEFT JOIN (SELECT id, ST_MakeValid(ST_MakePolygon(ST_AddPoint(geom, ST_StartPoint(geom)))) as geom FROM planet_osm_ways) c ON b.member_id = c.id
  LEFT JOIN relation_member_counts d ON a.id = d.relation_id
  WHERE d.member_role = 'outer' and d.count > 1
  GROUP BY a.id

  UNION
  --Multipolgons with outer + inner holes
  SELECT
  a.id as osm_id,
  CASE WHEN ST_Accum(innerpoly.geom) = '{NULL}'
  THEN ST_Multi(ST_MakePolygon(outerpoly.geom))::geometry(MULTIPOLYGON,900913)
  ELSE ST_Multi(ST_MakePolygon(outerpoly.geom, ST_Accum(innerpoly.geom order by innerpoly.sequence_id)))::geometry(MULTIPOLYGON,900913)
  END AS geom,
  'rel'::text as osm_source
  FROM planet_osm_rels a
  JOIN (
  	SELECT b.relation_id,
  	CASE WHEN ST_IsClosed(geom) THEN geom
  	ELSE ST_AddPoint(geom, ST_StartPoint(geom))
  	END as geom
  	FROM planet_osm_ways a
  	LEFT JOIN current_relation_members b ON a.id = b.member_id
  	LEFT JOIN relation_member_counts d ON b.relation_id = d.relation_id
  	WHERE b.member_role = 'outer' AND b.member_type = 'Way' AND d.count = 1
  ) outerpoly ON a.id = outerpoly.relation_id
  LEFT JOIN (
  	SELECT b.relation_id, a.id as way_id,
  	CASE WHEN ST_IsClosed(geom) THEN geom
  	ELSE ST_AddPoint(geom, ST_StartPoint(geom))
  	END as geom,
  	b.sequence_id
  	FROM planet_osm_ways a
  	LEFT JOIN current_relation_members b ON a.id = b.member_id
  	LEFT JOIN relation_member_counts d ON b.relation_id = d.relation_id
  	WHERE b.member_role = 'inner' AND  b.member_type = 'Way' AND d.count > 0
  ) innerpoly ON a.id = innerpoly.relation_id
  WHERE ((a.tags->'type') = 'multipolygon')
  GROUP BY a.id, outerpoly.geom

  ;
  `);

  commands.push(`
  CREATE OR REPLACE VIEW planet_osm_polygon AS
  SELECT a.osm_id,
  a.geom::geometry(MULTIPOLYGON,900913),
  b.tags
  FROM postgis_polygon_geom a
  LEFT JOIN planet_osm_ways b on a.osm_id = b.id
  WHERE osm_source = 'way'
  UNION
  SELECT a.osm_id,
  a.geom::geometry(MULTIPOLYGON,900913),
  b.tags
  FROM postgis_polygon_geom a
  LEFT JOIN planet_osm_rels b on a.osm_id = b.id
  WHERE osm_source = 'rel';
  `);

  commands.push(`
  CREATE OR REPLACE VIEW planet_osm_point AS
  SELECT
  a.id AS osm_id,
  c.geom::geometry(POINT,900913),
  a.tags
  FROM planet_osm_nodes a
  LEFT JOIN current_way_nodes b ON a.id = b.node_id
  LEFT JOIN postgis_node_geom c on a.id = c.node_id
  WHERE b.node_id IS NULL
  AND a.tags IS NOT NULL --ignore orphaned nodes without a way or a tag
  ;
  `);

  return Promise.each(commands, function(command){
    return knex.raw(command).catch(function(err){
      log.error(err); //don't propagate errors in case we are recovering from a incomplete layer
    });
  });

};

exports.down = function(knex, Promise) {

};
