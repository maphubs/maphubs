// @flow
var Map = require('../../models/map');
var Group = require('../../models/group');
var ScreenshotUtil = require('../../services/screenshot-utils');
//var debug = require('../../services/debug')('routes/map');
var log = require('../../services/log');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

    app.post('/api/map/create', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;

      var data = req.body;
      if(data && data.basemap && data.position && data.title && data.private !== undefined){
          var createMap;
          if(data.group_id){
            createMap = Group.allowedToModify(data.group_id, user_id)
            .then(function(allowed){
              if(allowed){
                return Map.createGroupMap(data.layers, data.style, data.basemap, data.position, data.title, user_id, data.group_id, data.private);
              }else{
                throw new Error('Unauthorized');
              }
            });
          }else{
            createMap = Map.createUserMap(data.layers, data.style, data.basemap, data.position, data.title, user_id, data.private);
          }
         createMap
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

    app.post('/api/map/copy', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;

      var data = req.body;
      if(data && data.map_id){
        Map.isPrivate(data.map_id).then(function(isPrivate){
          if(isPrivate){
            return Map.allowedToModify(data.map_id, user_id)
            .then(function(allowed){
              if(allowed){
                if(data.group_id){
                  //copy to a group
                  return Group.allowedToModify(data.group_id, user_id)
                  .then(function(groupAllowed){
                    if(groupAllowed){
                      return Map.copyMapToGroup(data.map_id, data.group_id, user_id)
                      .then(function(map_id){
                        //don't wait for screenshot
                        ScreenshotUtil.reloadMapThumbnail(map_id)
                        .then(function(){
                          return ScreenshotUtil.reloadMapImage(map_id);
                        }).catch(function(err){log.error(err);});
                        res.status(200).send({success: true, map_id});
                      }).catch(apiError(res, 500));
                    }else{
                      notAllowedError(res, 'group');
                    }
                  });
                }else{
                  //copy to the requesting user
                  return Map.copyMapToUser(data.map_id, user_id)
                  .then(function(map_id){
                    //don't wait for screenshot
                    ScreenshotUtil.reloadMapThumbnail(map_id)
                    .then(function(){
                      return ScreenshotUtil.reloadMapImage(map_id);
                    }).catch(function(err){log.error(err);});
                    res.status(200).send({success: true, map_id});
                  }).catch(apiError(res, 500));
                }
              }else{
                notAllowedError(res, 'map');
              }
            });
          }else{
            if(data.group_id){
                  //copy to a group
                  return Group.allowedToModify(data.group_id, user_id)
                  .then(function(groupAllowed){
                    if(groupAllowed){
                      return Map.copyMapToGroup(data.map_id, data.group_id, user_id)
                      .then(function(map_id){
                        //don't wait for screenshot
                        ScreenshotUtil.reloadMapThumbnail(map_id)
                        .then(function(){
                          return ScreenshotUtil.reloadMapImage(map_id);
                        }).catch(function(err){log.error(err);});
                        res.status(200).send({success: true, map_id});
                      }).catch(apiError(res, 500));
                    }else{
                      notAllowedError(res, 'group');
                    }
                  });
                }else{
                  //copy to the requesting user
                  Map.copyMapToUser(data.map_id, user_id)
                  .then(function(map_id){
                    //don't wait for screenshot
                    ScreenshotUtil.reloadMapThumbnail(map_id)
                    .then(function(){
                      return ScreenshotUtil.reloadMapImage(map_id);
                    }).catch(function(err){log.error(err);});
                    res.status(200).send({success: true, map_id});
                  }).catch(apiError(res, 500));
                }
          }
        });
      }else{
        apiDataError(res);
      }
    });

    /**
     * change map privacy settings
     */
    app.post('/api/map/privacy', csrfProtection, function(req, res) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }
      var user_id = req.session.user.id;
      var data = req.body;
      if(data && data.map_id && data.isPrivate){
        Map.allowedToModify(data.map_id, user_id)
        .then(function(allowed){
          if(allowed){
            return Map.setPrivate(data.map_id, data.isPrivate, data.user_id)
            .then(function(){
              res.status(200).send({success: true});
            });
          }else{
            notAllowedError(res, 'map');
          }
        }).catch(apiError(res, 200));
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
      if(data && data.layers && data.style && data.basemap && data.position && data.map_id && data.title){
        Map.allowedToModify(data.map_id, user_id)
        .then(function(allowed){
          if(allowed){
            return Map.updateMap(data.map_id, data.layers, data.style, data.basemap, data.position, data.title, user_id)
            .then(function(){
              res.status(200).send({success: true});
              //don't wait for screenshot
              ScreenshotUtil.reloadMapThumbnail(data.map_id)
              .then(function(){
                return ScreenshotUtil.reloadMapImage(data.map_id);
              }).catch(function(err){log.error(err);});
            }).catch(apiError(res, 200));
          }else{
            notAllowedError(res, 'map');
          }
        }).catch(apiError(res, 200));
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
