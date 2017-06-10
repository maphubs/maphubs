// @flow
var Promise = require('bluebird');
var User = require('../../models/user');
var Map = require('../../models/map');
var Layer = require('../../models/layer');
var Group = require('../../models/group');
var Stats = require('../../models/stats');
var debug = require('../../services/debug')('routes/map');
//var log = require('../../services/log');
var MapUtils = require('../../services/map-utils');
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var privateMapCheck = require('../../services/private-map-check').middlewareView;
var csrfProtection = require('csurf')({cookie: false});
var Locales = require('../../services/locales');

module.exports = function(app: any) {

  var recordMapView = function(session: Object, map_id: number, user_id: number,  next: any){
    if(!session.mapviews){
      session.mapviews = {};
    }
    if(!session.mapviews[map_id]){
      session.mapviews[map_id] = 1;
      Stats.addMapView(map_id, user_id).catch(nextError(next));
    }else{
      var views = session.mapviews[map_id];

      session.mapviews[map_id] = views + 1;
    }

    session.views = (session.views || 0) + 1;
  };


  app.get('/map/new', csrfProtection, (req, res, next) => {

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
            Layer.getPopularLayers()           
            .then((popularLayers) => {
                res.render('map', {title: 'New Map ', props:{popularLayers}, req});
            }).catch(nextError(next));
    } else {
      //get user id
      var user_id = req.session.user.maphubsUser.id;

      var canAddPrivateLayers = true; //TODO: adjust this based on group settings?

      var dataRequests: any = [
        Layer.getPopularLayers()
          .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);}),
        Layer.getUserLayers(user_id, 50, canAddPrivateLayers)
          .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);}),
        Group.getGroupsForUser(user_id)
      ];

      var editLayerId = req.query.editlayer;
      if(editLayerId){
        dataRequests.push(
          Layer.allowedToModify(editLayerId, user_id).then(allowed=>{
            if(allowed){
              return Layer.getLayerByID((editLayerId)).then(layer=>{
                layer.canEdit = true;
                return layer;
              });
            }else{
              return null;
            }
          })
        );
      }

      Promise.all(dataRequests)
        .then((results) => {
          var popularLayers = results[0];
          var myLayers = results[1];
          var myGroups = results[2];
          var editLayer;
          if(results.length === 4){
            editLayer = results[3];
          }
          res.render('map', {title: 'New Map ', props:{popularLayers, myLayers, myGroups, editLayer}, req});
        }).catch(nextError(next));
    }

  });

  app.get('/maps', csrfProtection, (req, res, next) => {

    Promise.all([
      Map.getFeaturedMaps(),
      Map.getRecentMaps(),
      Map.getPopularMaps()
    ])
      .then((results) => {
        var featuredMaps = results[0];
        var recentMaps = results[1];
        var popularMaps = results[2];
        res.render('maps', {title: req.__('Maps') + ' - ' + MAPHUBS_CONFIG.productName, props: {featuredMaps, recentMaps, popularMaps}, req});
      }).catch(nextError(next));
  });

  app.get('/user/:username/maps', csrfProtection, (req, res, next) => {

    var username = req.params.username;
    debug(username);
    if(!username){apiDataError(res);}
    var myMaps = false;

    function completeRequest(){
      User.getUserByName(username)
      .then((user) => {
        if(user){
          return Map.getUserMaps(user.id)
          .then((maps) => {
            return res.render('usermaps', {title: 'Maps - ' + username, props:{user, maps, myMaps}, req});
          });
        }else{
          res.redirect('/notfound?path='+req.path);
        }
      }).catch(nextError(next));
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          completeRequest();
    } else {
      //get user id
      var user_id = req.session.user.maphubsUser.id;

      //get user for logged in user
      User.getUser(user_id)
      .then((user) => {
        //flag if requested user is logged in user
        if(user.display_name === username){
          myMaps = true;
        }
        completeRequest();
      }).catch(nextError(next));
    }
  });

  app.get('/map/view/:map_id/*', csrfProtection, privateMapCheck, (req, res, next) => {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res);
    }

    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    recordMapView(req.session, map_id, user_id, next);


    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
        MapUtils.completeUserMapRequest(req, res, next, map_id, false);
    } else {
      //get user id
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        MapUtils.completeUserMapRequest(req, res, next, map_id, allowed);
      });
    }
  });

  app.get('/user/:username/map/:map_id/*', csrfProtection, privateMapCheck, (req, res, next) => {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res);
    }

    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    recordMapView(req.session, map_id, user_id, next);


    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
        MapUtils.completeUserMapRequest(req, res, next, map_id, false);
    } else {
      //get user id
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        MapUtils.completeUserMapRequest(req, res, next, map_id, allowed);
      });
    }
  });

  app.get('/map/edit/:map_id', csrfProtection, (req, res, next) => {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res);
    }

    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
        //need to be logged in
        res.redirect('/unauthorized');
    } else {
      //get user id
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        if(allowed){

          return Promise.all([
          Map.getMap(map_id),
          Map.getMapLayers(map_id, true)
          .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);}),
          Layer.getPopularLayers()
          .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);}),
          Layer.getUserLayers(user_id, 50, true)
          .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);}),
          Group.getGroupsForUser(user_id)
          ])
          .then((results) => {
            var map = results[0];
            var layers = results[1];
            var popularLayers = results[2];
            var myLayers = results[3];
            var myGroups = results[4];
            var title: string = 'Map';
            if(map.title){
              title = Locales.getLocaleStringObject(req.locale, map.title);
            }
              res.render('mapedit',
               {
                 title: title +' - ' + MAPHUBS_CONFIG.productName,
                 props:{map, layers, popularLayers, myLayers, myGroups},
                 hideFeedback: true,
                 req
               }
             );
          }).catch(nextError(next));
        }else{
          res.redirect('/unauthorized');
        }
      });
    }
  });

  app.get('/map/embed/:map_id', csrfProtection, privateMapCheck, (req, res, next) => {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res);
    }

    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    recordMapView(req.session, map_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, false, false);
    } else {
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, allowed, false);
      });
    }
  });

  app.get('/map/embed/:map_id/static', csrfProtection, privateMapCheck, (req, res, next) => {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res);
    }

    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    recordMapView(req.session, map_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, false, false);
    } else {
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, allowed, false);
      });
    }
  });

  app.get('/map/embed/:map_id/interactive', csrfProtection, privateMapCheck, (req, res, next) => {
    var map_id = req.params.map_id;
    if(!map_id){
      apiDataError(res);
    }

    var user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    recordMapView(req.session, map_id, user_id, next);

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, false, true);
    } else {
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, allowed, true);
      });
    }
  });
};
