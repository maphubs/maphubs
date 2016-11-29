// @flow
var knex = require('../../connection.js');
var toGeoJSON = require('../../services/osm-data-to-geojson.js');
var queryBbox = require('../../services/query-bbox.js');
var BoundingBox = require('../../services/bounding-box.js');
var log = require('../../services/log.js');

module.exports = function(app: any) {
  /**
   * @api {get} /map GeoJSON - Get entities in bounding box
   * @apiGroup bbox
   * @apiName Map
   * @apiVersion 0.1.0
   *
   * @apiParam {Number[4]} bbox [min_lon, min_lat, max_lon, max_lat]
   *
   * @apiSuccess {GeoJSON} FeatureCollection List of OSM Roads
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743
   *
   */
  app.get('/map', function(req, res, next) {
    // parse and validate bbox parameter from query
    // See services/BoundingBox.js.
    var paramString = req.query.bbox || '';
    var bbox = new BoundingBox.FromCoordinates(paramString.split(','));
    if (bbox.error) {
      log.error('Could not create bounding box for map-json', bbox);
      return next(bbox.error);
    }

    queryBbox(knex, bbox)
      .then(function(result) {
        res(toGeoJSON(result));
      })
      .catch(function(err) {
        log.error(err);
        next(err);
      });
  });
};
