// @flow
var knex = require('../../connection.js');
var dbgeo = require('dbgeo');
var Promise = require('bluebird');
var log = require('../../services/log.js');
var debug = require('../../services/debug')('routes/search');
var turf_bbox = require('@turf/bbox');
var geojsonUtils = require('../../services/geojson-utils');
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.get('/search', csrfProtection, function(req, res) {
      res.render('search', {
        title: req.__('Search') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {}, req
      });
  });

  //TODO: rewrite
  app.get('/api/global/search', function(req, res, next) {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
    }
    var q = req.query.q.toLowerCase();
    var commands = [
      //points
      knex.raw(`
        SELECT omh.layers.layer_id, array_agg('n'|| id) AS ids 
        FROM current_nodes
        LEFT JOIN omh.layers on omh.layers.layer_id = current_nodes.layer_id
        WHERE omh.layers.private = false AND id IN(SELECT node_id FROM current_node_tags
          WHERE lower(v) LIKE '%` + q +`%')
          GROUP BY omh.layers.layer_id;
      `),
      //lines
      knex.raw(`
        select omh.layers.layer_id, array_agg('w'|| id) as ids
         from current_ways a
         left join (SELECT
           way_id,
           CASE WHEN count(k) = 0
           THEN NULL
           ELSE hstore(array_agg(k::text),array_agg(v::text))
           END AS tags
           FROM current_way_tags
           GROUP BY way_id) b on a.id = b.way_id
        left join omh.layers on omh.layers.layer_id = a.layer_id
        where omh.layers.private = false AND id IN(select way_id from current_way_tags where lower(v) LIKE '%` + q +`%')
        AND ((tags->'area') NOT IN ('yes', 'true') OR (tags->'area') IS NULL)
         AND id NOT IN (
           SELECT DISTINCT current_relations.id FROM current_relation_tags
           LEFT JOIN current_relations ON current_relation_tags.relation_id = current_relations.id
           LEFT JOIN current_relation_members  ON current_relation_members.relation_id = current_relations.id
           WHERE k = 'type' AND v = 'multipolygon' AND member_type = 'Way'
         )
        group by omh.layers.layer_id;
      `),
      //polygons (not multipolygons)
      knex.raw(`
      select omh.layers.layer_id, array_agg('p'|| id) as ids
      from current_ways a
      left join current_way_tags b  on a.id = b.way_id
      left join omh.layers on omh.layers.layer_id = a.layer_id
      where omh.layers.private = false AND lower(b.v) LIKE '%` + q +`%'
      AND id IN (select distinct way_id from current_way_tags where k='area' AND v IN ('yes', 'true'))
      AND id NOT IN (
       SELECT DISTINCT current_relation_members.member_id FROM current_relation_tags
       LEFT JOIN current_relations ON current_relation_tags.relation_id = current_relations.id
       LEFT JOIN current_relation_members ON current_relation_members.relation_id = current_relations.id
       WHERE k = 'type' AND v = 'multipolygon' AND member_type = 'Way'
      )
      group by omh.layers.layer_id;
      `),
      //multipolygons
      knex.raw(`
      select omh.layers.layer_id, array_agg(distinct 'm'|| id) as ids
       from current_relations a
       left join current_relation_tags b on a.id = b.relation_id
       left join omh.layers on omh.layers.layer_id = a.layer_id
      where omh.layers.private = false AND lower(v) LIKE '%` + q +`%'
      group by omh.layers.layer_id;
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
          dataCommands.push(
            knex('layers.points_'+layerNode.layer_id)
            .select(knex.raw("osm_id, " + layerNode.layer_id + "as layer_id, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
            .whereIn('osm_id', layerNode.ids)
            .catch(function(err){
              log.error(err);
            })
          );
        });

        layerWays.forEach(function(layerWay){
          dataCommands.push(
            knex('layers.lines_'+layerWay.layer_id)
            .select(knex.raw("osm_id, " + layerWay.layer_id + "as layer_id, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
            .whereIn('osm_id', layerWay.ids)
            .catch(function(err){
              log.error(err);
            })
          );          
        });

        layerPolys.forEach(function(layerPoly){
          dataCommands.push(
            knex('layers.polygons_'+layerPoly.layer_id)
          .select(knex.raw("osm_id, " + layerPoly.layer_id + "as layer_id, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
          .where('osm_source', 'way')
          .whereIn('osm_id', layerPoly.ids)
          .catch(function(err){
            log.error(err);
          }));
        });

        layerMultiPolys.forEach(function(layerMultiPoly){
          dataCommands.push(
            knex('layers.polygons_'+layerMultiPoly.layer_id)
            .select(knex.raw("'m'|| osm_id, " + layerMultiPoly.layer_id + "as layer_id, ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, '{' || replace(tags::text, '=>', ':') || '}' as tags"))
            .where('osm_source', 'rel')
            .whereIn('osm_id', layerMultiPoly.ids)
            .catch(function(err){
              log.error(err);
            })
          );
        });

        Promise.all(dataCommands)
          .then(function(results) {
          var data = [];
          results.forEach(function(result){
            if(result && Array.isArray(result)){
               data = data.concat(result);
            }         
          });
          debug('results: ' + data.length);

        dbgeo.parse(data,{
          "outputFormat": "geojson",
          "geometryColumn": "geom",
          "geometryType": "geojson"
        }, function(error, result) {
          if (error) {
            log.error(error);
            next(error);
          }
          //convert tags to properties
          result.features = geojsonUtils.convertTagsToProps(result.features);
          var bbox = turf_bbox(result);
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
