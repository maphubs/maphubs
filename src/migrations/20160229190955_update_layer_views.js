var replaceViews = function(layer_id, presets, db, Promise){
  return dropLayerViews(layer_id, db, Promise)
  .then(() => {
    return createLayerViews(layer_id, presets, db, Promise);
  });
};

var dropLayerViews = function(layer_id, db, Promise){

  var commands = [
    'DROP VIEW IF EXISTS layers.points_' + layer_id,
    'DROP VIEW IF EXISTS layers.lines_' + layer_id,
    'DROP VIEW IF EXISTS layers.polygons_' + layer_id,
    'DROP MATERIALIZED VIEW IF EXISTS layers.polygon_geom_' + layer_id,
    'DROP VIEW IF EXISTS layers.rel_counts_' + layer_id,
    'DROP VIEW IF EXISTS layers.rels_' + layer_id,
    'DROP VIEW IF EXISTS layers.ways_' + layer_id,
    'DROP MATERIALIZED VIEW IF EXISTS layers.way_geom_' + layer_id,
    'DROP VIEW IF EXISTS layers.nodes_' + layer_id,
    'DROP MATERIALIZED VIEW IF EXISTS layers.node_geom_' + layer_id
  ];

  return Promise.each(commands, (command) => {
    return db.raw(command);
  });
};

var createLayerViews = function(layer_id, presets, db, Promise){
  var tagColumns = '';
  if(presets){
    presets.forEach((preset) => {
      tagColumns += `(tags->'` + preset.tag + `') as "` + preset.tag + `",`;
    });
  }

  //Node Geometry Saved as a Materialized View for Performance
  var commands = [
    `CREATE MATERIALIZED VIEW layers.node_geom_` + layer_id + ` AS
    SELECT
    id AS node_id,
    ST_Transform(ST_SetSRID(ST_MakePoint(longitude::float/10000000,latitude::float/10000000), 4326), 900913)::geometry(POINT,900913) AS geom
    FROM current_nodes
    WHERE layer_id = ` + layer_id + `
    WITH DATA
    ;`,

    `CREATE UNIQUE INDEX node_geom_` + layer_id + `_id_idx
      ON layers.node_geom_` + layer_id + ` (node_id);`,

    `CREATE INDEX node_geom_` + layer_id + `_geom_idx ON layers.node_geom_` + layer_id + ` USING GIST (geom);`,

    `CREATE or replace VIEW layers.nodes_` + layer_id + ` AS
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
    WHERE a.layer_id = ` + layer_id + `
    group by a.id
    ;`,

    `CREATE MATERIALIZED VIEW layers.way_geom_` + layer_id + ` AS
    SELECT
    a.id AS way_id,
    ST_MakeLine(c.geom ORDER BY b.sequence_id)::geometry(LINESTRING,900913) AS geom,
    array_agg(b.node_id ORDER BY b.sequence_id) as nodes
    FROM current_ways a
    LEFT JOIN current_way_nodes b ON a.id = b.way_id
    LEFT JOIN layers.node_geom_` + layer_id + ` c ON b.node_id = c.node_id
    WHERE a.layer_id = ` + layer_id + `
    GROUP BY a.id
    WITH DATA
    ;`,

    `CREATE UNIQUE INDEX way_geom_` + layer_id + `_id_idx
      ON layers.way_geom_` + layer_id + ` (way_id);`,

    `CREATE INDEX way_geom_` + layer_id + `_geom_idx ON layers.way_geom_` + layer_id + ` USING GIST (geom);`,

    `CREATE OR REPLACE VIEW layers.ways_` + layer_id + ` AS
    SELECT
    a.way_id as id,
    a.nodes,
    CASE WHEN count(d.k) = 0
    THEN NULL
    ELSE hstore(array_agg(d.k::text),array_agg(d.v::text))
    END AS tags,
    FALSE::BOOLEAN as pending,
    a.geom::geometry(LINESTRING,900913) --also adding the geom (not included in osm2pgsql)
    FROM layers.way_geom_` + layer_id + ` a
    LEFT JOIN current_way_tags d ON a.way_id = d.way_id
    GROUP BY a.way_id, a.nodes, a.geom
    ;`,

    `CREATE OR REPLACE VIEW layers.rels_` + layer_id + ` AS
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
    AND a.layer_id = ` + layer_id + `
    GROUP BY a.id
    ;`,

    `CREATE OR REPLACE VIEW layers.rel_counts_` + layer_id + ` AS
    SELECT a.relation_id, a.member_role, count(a.member_role)
    FROM current_relation_members a
    JOIN current_relations b on b.id = a.relation_id
    WHERE a.member_type = 'Way'
    AND b.layer_id = ` + layer_id + `
    group by a.relation_id, a.member_role
    ;`,

    `CREATE MATERIALIZED VIEW layers.polygon_geom_` + layer_id + ` AS
    --polygons from ways
    SELECT
    id AS osm_id,
    ST_Multi(ST_MakePolygon(ST_AddPoint(geom, ST_StartPoint(geom))))::geometry(MULTIPOLYGON,900913) AS geom,
    'way'::text as osm_source
    FROM layers.ways_` + layer_id + `
    WHERE (((tags->'area') = 'yes') OR ((tags->'area') = 'true'))

    UNION
    --Multipolygons
    SELECT
    a.id as osm_id,
    ST_CollectionExtract(ST_Multi(ST_MakeValid(ST_Collect(c.geom ORDER BY b.sequence_id))), 3)::geometry(MULTIPOLYGON,900913) as geom,
    'rel'::text as osm_source
    FROM layers.rels_` + layer_id + ` a
    LEFT JOIN current_relation_members b ON a.id = b.relation_id
    LEFT JOIN (SELECT id, ST_MakePolygon(ST_AddPoint(geom, ST_StartPoint(geom))) as geom FROM layers.ways_` + layer_id + `) c ON b.member_id = c.id
    LEFT JOIN layers.rel_counts_` + layer_id + ` d ON a.id = d.relation_id
    WHERE d.member_role = 'outer' and d.count > 1
    GROUP BY a.id

    UNION
    --Multipolgons with outer + inner holes
    SELECT
    a.id as osm_id,
    CASE WHEN ST_Accum(innerpoly.geom) = '{NULL}'
    THEN ST_CollectionExtract(ST_Multi(ST_MakePolygon(outerpoly.geom)),3)::geometry(MULTIPOLYGON,900913)
    ELSE ST_CollectionExtract(ST_Multi(ST_MakePolygon(outerpoly.geom, ST_Accum(innerpoly.geom order by innerpoly.sequence_id))),3)::geometry(MULTIPOLYGON,900913)
    END AS geom,
    'rel'::text as osm_source
    FROM layers.rels_` + layer_id + ` a
    JOIN (
      SELECT b.relation_id,
      CASE WHEN ST_IsClosed(geom) THEN geom
      ELSE ST_AddPoint(geom, ST_StartPoint(geom))
      END as geom
      FROM layers.ways_` + layer_id + ` a
      LEFT JOIN current_relation_members b ON a.id = b.member_id
      LEFT JOIN layers.rel_counts_` + layer_id + ` d ON b.relation_id = d.relation_id
      WHERE b.member_role = 'outer' AND b.member_type = 'Way' AND d.count = 1
    ) outerpoly ON a.id = outerpoly.relation_id
    LEFT JOIN (
      SELECT b.relation_id, a.id as way_id,
      CASE WHEN ST_IsClosed(geom) THEN geom
      ELSE ST_AddPoint(geom, ST_StartPoint(geom))
      END as geom,
      b.sequence_id
      FROM layers.ways_` + layer_id + ` a
      LEFT JOIN current_relation_members b ON a.id = b.member_id
      LEFT JOIN layers.rel_counts_` + layer_id + ` d ON b.relation_id = d.relation_id
      WHERE b.member_role = 'inner' AND  b.member_type = 'Way' AND d.count > 0
    ) innerpoly ON a.id = innerpoly.relation_id
    WHERE ((a.tags->'type') = 'multipolygon')
    GROUP BY a.id, outerpoly.geom

    WITH DATA
    ;`,

    `CREATE INDEX polygon_geom_` + layer_id + `_id_idx
      ON layers.polygon_geom_` + layer_id + ` (osm_id);`,

    `CREATE INDEX polygon_geom_` + layer_id + `_geom_idx ON layers.polygon_geom_` + layer_id + ` USING GIST (geom);`,

    `CREATE or replace VIEW layers.polygons_` + layer_id + ` AS
    SELECT a.osm_id,
    ` + layer_id + ` as layer_id,
    a.geom::geometry(MULTIPOLYGON,900913),`
    + tagColumns +
    `b.tags
    FROM layers.polygon_geom_` + layer_id + ` a
    LEFT JOIN layers.ways_` + layer_id + ` b on a.osm_id = b.id
    WHERE osm_source = 'way'
    UNION
    SELECT a.osm_id,
    ` + layer_id + ` as layer_id,
    a.geom::geometry(MULTIPOLYGON,900913),`
    + tagColumns +
    `b.tags
    FROM layers.polygon_geom_` + layer_id + ` a
    LEFT JOIN layers.rels_` + layer_id + ` b on a.osm_id = b.id
    WHERE osm_source = 'rel';`,


    `CREATE OR REPLACE VIEW layers.lines_` + layer_id + ` AS
    SELECT
    id as osm_id,
    ` + layer_id + ` as layer_id,
    geom::geometry(LINESTRING,900913),`
    + tagColumns +
    `tags
    FROM layers.ways_` + layer_id + `
    WHERE ((tags->'area') NOT IN ('yes', 'true') OR (tags->'area') IS NULL)
      AND id NOT IN (
        SELECT DISTINCT current_relations.id FROM current_relation_tags
        LEFT JOIN current_relations ON current_relation_tags.relation_id = current_relations.id
        LEFT JOIN current_relation_members  ON current_relation_members.relation_id = current_relations.id
        WHERE k = 'type' AND v = 'multipolygon' AND member_type = 'Way' AND layer_id = ` + layer_id + `
      )
    ;`,

    `CREATE OR REPLACE VIEW layers.points_` + layer_id + ` AS
    SELECT
    a.id AS osm_id,
    ` + layer_id + ` as layer_id,
    c.geom::geometry(POINT,900913),`
    + tagColumns +
    `a.tags
    FROM layers.nodes_` + layer_id + ` a
    LEFT JOIN current_way_nodes b ON a.id = b.node_id
    LEFT JOIN layers.node_geom_` + layer_id + ` c on a.id = c.node_id
    WHERE b.node_id IS NULL
    AND a.tags IS NOT NULL --ignore orphaned nodes without a way or a tag
    ;`

  ];

  return Promise.each(commands, (command) => {
    return db.raw(command);
  });
};


exports.up = function(knex, Promise) {
  return knex('omh.layers').select('layer_id', 'presets')
  .then((layers) => {
    var commands = [];
    layers.forEach((layer) => {
      commands.push(replaceViews(layer.layer_id, layer.presets, knex, Promise));
    });
    return Promise.all(commands);
  });
};

exports.down = function() {

};
