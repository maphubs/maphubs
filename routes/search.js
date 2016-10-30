/* @flow weak */
var knex = require('../connection.js');
var dbgeo = require('dbgeo');
var Promise = require('bluebird');
var log = require('../services/log.js');
var debug = require('../services/debug')('routes/search');
var extent = require('turf-extent');

module.exports = function(app) {

  app.get('/search', function(req, res) {
      res.render('search', {
        title: req.__('Search') + ' - ' + MAPHUBS_CONFIG.productName,
        mapboxgl:true,
        props: {}, req
      });
  });

  app.get('/api/global/search', function(req, res, next) {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    var q = req.query.q.toLowerCase();
    var commands = [
      knex.raw(`
        SELECT layer_id, array_agg(id) AS ids FROM current_nodes
        WHERE id IN(SELECT node_id FROM current_node_tags WHERE lower(v) LIKE '%` + q +`%') GROUP BY layer_id;
      `),
      knex.raw(`
        select layer_id, array_agg(id) as ids
         from current_ways a
         left join (SELECT
           way_id,
           CASE WHEN count(k) = 0
           THEN NULL
           ELSE hstore(array_agg(k::text),array_agg(v::text))
           END AS tags
           FROM current_way_tags
           GROUP BY way_id) b on a.id = b.way_id
        where id IN(select way_id from current_way_tags where lower(v) LIKE '%` + q +`%')
        AND ((tags->'area') NOT IN ('yes', 'true') OR (tags->'area') IS NULL)
         AND id NOT IN (
           SELECT DISTINCT current_relations.id FROM current_relation_tags
           LEFT JOIN current_relations ON current_relation_tags.relation_id = current_relations.id
           LEFT JOIN current_relation_members  ON current_relation_members.relation_id = current_relations.id
           WHERE k = 'type' AND v = 'multipolygon' AND member_type = 'Way'
         )
        group by layer_id;
      `),
      knex.raw(`
      select layer_id, array_agg(id) as ids
      from current_ways a
      left join global_way_tags b on a.id = b.way_id
      where id IN(select way_id from current_way_tags where lower(v) LIKE '%` + q +`%')
      AND ((tags->'area') IN ('yes', 'true'))
      AND id NOT IN (
       SELECT DISTINCT current_relations.id FROM current_relation_tags
       LEFT JOIN current_relations ON current_relation_tags.relation_id = current_relations.id
       LEFT JOIN current_relation_members  ON current_relation_members.relation_id = current_relations.id
       WHERE k = 'type' AND v = 'multipolygon' AND member_type = 'Way'
      )
      group by layer_id;
      `),
      knex.raw(`
      select layer_id, array_agg(id) as ids
       from current_relations a
      where id IN(select relation_id from current_relation_tags where lower(v) LIKE '%` + q +`%')
      group by layer_id;
      `)

    ];

    Promise.all(commands)
      .then(function(results) {
        var layerNodes = results[0].rows;
        var layerWays = results[1].rows;
        var layerPolys = results[2].rows;
        var layerMultiPolys = results[3].rows;
        debug('layers with node results: ' + layerNodes.length);
        debug('layers with way results: ' + layerWays.length);
        debug('layers with polygon results: ' + layerPolys.length);
        debug('layers with mulitpolygon results: ' + layerMultiPolys.length);

        var dataCommands = [];

        layerNodes.forEach(function(layerNode){
          dataCommands.push(knex('layers.points_'+layerNode.layer_id)
          .select(knex.raw("osm_id, " + layerNode.layer_id + "as layer_id, ST_AsText(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
          .whereIn('osm_id', layerNode.ids));
        });

        layerWays.forEach(function(layerWay){
          dataCommands.push(knex('layers.lines_'+layerWay.layer_id)
          .select(knex.raw("osm_id, " + layerWay.layer_id + "as layer_id, ST_AsText(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
          .whereIn('osm_id', layerWay.ids));
        });

        layerPolys.forEach(function(layerPoly){
          dataCommands.push(knex('layers.polygons_'+layerPoly.layer_id)
          .select(knex.raw("osm_id, " + layerPoly.layer_id + "as layer_id, ST_AsText(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
          .whereIn('osm_id', layerPoly.ids));
        });

        layerMultiPolys.forEach(function(layerMultiPoly){
          dataCommands.push(knex('layers.polygons_'+layerMultiPoly.layer_id)
          .select(knex.raw("osm_id, " + layerMultiPoly.layer_id + "as layer_id, ST_AsText(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
          .whereIn('osm_id', layerMultiPoly.ids));
        });

        Promise.all(dataCommands)
          .then(function(results) {
          var data = [];
          results.forEach(function(result){
            data = data.concat(result);
          });
          debug('results: ' + data.length);

        dbgeo.parse({
          data,
          "outputFormat": "geojson",
          "geometryColumn": "geom",
          "geometryType": "wkt"
        }, function(error, result) {
          if (error) {
            log.error(error);
            next(error);
          }
          //convert tags to properties
          result.features.forEach(function(feature) {
            var tags = JSON.parse(feature.properties.tags);
            Object.keys(tags).map(function(key) {
              var val = tags[key];
              feature.properties[key] = val;
            });
            delete feature.properties.tags;
          });
          var bbox = extent(result);
          result.bbox = bbox;

          res.send(result);
        });
      }).catch(function(err) {
        log.error(err);
        next(err);
      });
      })
      .catch(function(err) {
        log.error(err);
        next(err);
      });

  });

};
