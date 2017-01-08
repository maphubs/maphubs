// @flow
var knex = require('../../connection.js');
var queryBbox = require('../../services/query-bbox.js');
var XML = require('../../services/xml.js');
var Promise = require('bluebird');
var Map = require('../../models/map');
var BoundingBox = require('../../services/bounding-box.js');
var ScreenshotUtil = require('../../services/screenshot-utils');
var debug = require('../../services/debug')('routes/map');
var log = require('../../services/log');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;

var csrfProtection = require('csurf')({cookie: false});
var privateLayerCheck = require('../../services/private-layer-check').middleware;

module.exports = function(app: any) {

    //disable global API only support one layer at a time for now
     /*
    app.get('/xml/map', function (req, res, next) {
        // parse and validate bbox parameter from query
        // See services/BoundingBox.js.
        var paramString = req.query.bbox || '';
        var bbox = new BoundingBox.FromCoordinates(paramString.split(','));
        if (bbox.error) {
            res.send(400, {error: bbox.error});
            return;
        }

        queryBbox(knex, bbox, null)
            .then(function (result) {
                var xmlDoc = XML.write({
                    bbox,
                    nodes: Node.withTags(result.nodes, result.nodetags, 'node_id'),
                    ways: Node.withTags(result.ways, result.waytags, 'way_id'),
                    relations: result.relations
                });
                res.header("Content-Type", "text/xml");
                res.send(xmlDoc.toString());
            }).catch(nextError(next));
    });
    */

    app.get('/xml/map/:layer_id', privateLayerCheck, function (req, res, next) {
      // parse and validate bbox parameter from query
      // See services/BoundingBox.js.
      var layer_id = parseInt(req.params.layer_id || '', 10);
      var paramString = req.query.bbox || '';
          var bbox = new BoundingBox.FromCoordinates(paramString.split(','));
          if (bbox.error) {
              res.status(500).send({error: bbox.error});
              return;
          }

          queryBbox(knex, bbox, layer_id)
          .then(function (result) {
            debug("convert result to XML");
              var xmlDoc = XML.write({
                  bbox,
                  nodes:result.nodes,
                  ways: result.ways,
                  relations: result.relations
              });
              debug("XML ready");
              res.header("Content-Type", "text/xml");
              res.send(xmlDoc.toString());
          }).catch(nextError(next));
    });

    app.post('/api/map/create/usermap', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;

      var data = req.body;
      if(data && data.basemap && data.position && data.title){
          Map.createUserMap(data.layers, data.style, data.basemap, data.position, data.title, user_id)
          .then(function(result){
            var map_id = result[0];
            ScreenshotUtil.reloadMapThumbnail(map_id)
            .then(function(){
              return ScreenshotUtil.reloadMapImage(map_id);
            })
            .catch(function(err){log.error(err);});
            res.status(200).send({success: true, map_id});
          }).catch(apiError(res, 500));
      }else{
        apiDataError(res);
      }
    });

    //TODO: [Private Maps]
    app.post('/api/map/copy', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;

      var data = req.body;
      if(data && data.map_id){
          Map.copyMap(data.map_id, user_id)
          .then(function(map_id){
            ScreenshotUtil.reloadMapThumbnail(map_id)
            .then(function(){
              return ScreenshotUtil.reloadMapImage(map_id);
            })
            .catch(function(err){log.error(err);});
            res.status(200).send({success: true, map_id});
          }).catch(apiError(res, 500));
      }else{
        apiDataError(res);
      }
    });


    app.post('/api/map/save', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;

      var data = req.body;
      if(data && data.layers && data.style && data.basemap && data.position && data.map_id){
        Map.allowedToModify(data.map_id, user_id)
        .then(function(allowed){
          if(allowed){
            Map.updateMap(data.map_id, data.layers, data.style, data.basemap, data.position, data.title, user_id)
            .then(function(){
              res.status(200).send({success: true});
              ScreenshotUtil.reloadMapThumbnail(data.map_id)
              .then(function(){
                return ScreenshotUtil.reloadMapImage(data.map_id);
              })
              .catch(function(err){log.error(err);});
            }).catch(apiError(res, 500));
          }else{
            notAllowedError(res, 'map');
          }
        }).catch(apiError(res, 500));
      }else{
        apiDataError(res);
      }
    });

    app.post('/api/map/delete', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;

      var data = req.body;
      if(data && data.map_id){
        Map.allowedToModify(data.map_id, user_id)
        .then(function(allowed){
          if(allowed){
            Map.deleteMap(data.map_id)
            .then(function(){
              res.status(200).send({success: true});
            }).catch(apiError(res, 500));
          }else{
            notAllowedError(res, 'map');
          }
        }).catch(apiError(res, 500));
      }else{
        apiDataError(res);
      }
    });

    //TODO: [Private Maps]
    app.get('/api/map/info/:id', function(req, res) {
      var map_id = parseInt(req.params.id || '', 10);
      var user_id = -1;
      if(req.session.user){
        user_id = req.session.user.id;
      }
      
      Promise.all([
      Map.getMap(map_id),
      Map.getMapLayers(map_id, user_id)
      ])
      .then(function(results){
        var map = results[0];
        map.layers = results[1];
        res.status(200).send({success: true, map});
      }).catch(apiError(res, 500));
    });

    //TODO: [Private Maps]
    app.get('/api/maps/search/suggestions', function(req, res) {
      if(!req.query.q){
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
        return;
      }
      var q = req.query.q;
      Map.getSearchSuggestions(q)
        .then(function(result){
          var suggestions = [];
            result.forEach(function(map){
              suggestions.push({key: map.map_id, value:map.title});
            });
            res.send({suggestions});
        }).catch(apiError(res, 500));
    });

    //TODO: [Private Maps]
    app.get('/api/maps/search', function(req, res) {
      if (!req.query.q) {
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
        return;
      }
      Map.getSearchResults(req.query.q)
        .then(function(result){
          res.status(200).send({maps: result});
        }).catch(apiError(res, 500));
    });
};
