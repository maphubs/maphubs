// @flow
var User = require('../../models/user');
var Map = require('../../models/map');
var Layer = require('../../models/layer');
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


  app.get('/map/new', csrfProtection, async (req, res, next) => {
    try{
      if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
        const popularLayers = await Layer.getPopularLayers();           
        return res.render('map', {title: 'New Map ', props:{popularLayers}, req});
      } else {
        //get user id
        var user_id = req.session.user.maphubsUser.id;

        var canAddPrivateLayers = true; //TODO: adjust this based on group settings?

        let popularLayers = await Layer.getPopularLayers();
        await Layer.attachPermissionsToLayers(popularLayers, user_id);

        let myLayers = await Layer.getUserLayers(user_id, 50, canAddPrivateLayers);
        await Layer.attachPermissionsToLayers(myLayers, user_id);

        const editLayerId = req.query.editlayer;
        let editLayer;
        if(editLayerId){
            const allowed = await Layer.allowedToModify(editLayerId, user_id);
            if(allowed){
              editLayer = await Layer.getLayerByID((editLayerId));
              if(editLayer){
                editLayer.canEdit = true;
              }
            }
        }

        return res.render('map', {
          title: req.__('New Map'), 
          props:{popularLayers, myLayers, editLayer}, 
          hideFeedback: true,
          req
        });
      }
    }catch(err){
      nextError(next)(err);
    }

  });

  app.get('/maps', csrfProtection, async (req, res, next) => {
    try{
      const featuredMaps = await Map.getFeaturedMaps();
      const recentMaps = await Map.getRecentMaps();
      const popularMaps = await Map.getPopularMaps();
      return res.render('maps', {
        title: req.__('Maps') + ' - ' + MAPHUBS_CONFIG.productName, 
        props: {featuredMaps, recentMaps, popularMaps}, 
        req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/maps/all', csrfProtection, async (req, res, next) => {
    try{
      let locale = req.locale ? req.locale : 'en';
      const maps = await Map.getAllMaps().orderByRaw(`omh.maps.title -> '${locale}'`);
      return res.render('allmaps', {
        title: req.__('Maps') + ' - ' + MAPHUBS_CONFIG.productName, 
        props: {maps}, 
        req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/user/:username/maps', csrfProtection, async (req, res, next) => {
    try{
      var username = req.params.username;
      debug.log(username);
      if(!username){apiDataError(res);}
      var myMaps = false;

      var completeRequest = async function(){
        const user = await User.getUserByName(username);
        if(user){
          const maps = await Map.getUserMaps(user.id);
          return res.render('usermaps', {
            title: 'Maps - ' + username, 
            props:{user, maps, myMaps}, 
            req
          });
        }else{
          return res.redirect('/notfound?path='+req.path);
        }
      };

      if (!req.isAuthenticated || !req.isAuthenticated()
          || !req.session || !req.session.user) {
            completeRequest();
      } else {
        const user_id = req.session.user.maphubsUser.id;
        const user = await User.getUser(user_id);
        //flag if requested user is logged in user
        if(user.display_name === username){
          myMaps = true;
        }
        completeRequest();
      }
    }catch(err){nextError(next)(err);}
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
        MapUtils.completeUserMapRequest(req, res, next, map_id, false, false);
    } else {
      //get user id
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        return MapUtils.completeUserMapRequest(req, res, next, map_id, allowed, false);
      }).catch(nextError(next));
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
        MapUtils.completeUserMapRequest(req, res, next, map_id, false, false);
    } else {
      //get user id
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        return MapUtils.completeUserMapRequest(req, res, next, map_id, allowed, false);
      }).catch(nextError(next));
    }
  });

  app.get('/map/edit/:map_id', csrfProtection, async (req, res, next) => {
    try{
      const map_id = req.params.map_id;
      if(!map_id){
        apiDataError(res);
      }

      let user_id = -1;
      if(req.session.user){
        user_id = req.session.user.maphubsUser.id;
      }

      if (!req.isAuthenticated || !req.isAuthenticated()
          || !req.session || !req.session.user) {
          //need to be logged in
          res.redirect('/unauthorized');
      } else {
        //get user id
        const allowed = await Map.allowedToModify(map_id, user_id);
        if(allowed){
            const map = await Map.getMap(map_id);
            const layers = await Map.getMapLayers(map_id, true)
              .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);});
            const popularLayers = await Layer.getPopularLayers()
              .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);});
            var myLayers = await Layer.getUserLayers(user_id, 50, true)
              .then(layers=>{return Layer.attachPermissionsToLayers(layers, user_id);});

            let title: string = 'Map';
            if(map && map.title){
              title = Locales.getLocaleStringObject(req.locale, map.title);
            }
            return res.render('mapedit',
              {
                title: title +' - ' + MAPHUBS_CONFIG.productName,
                props:{
                  map, 
                  layers, 
                  popularLayers, 
                  myLayers
                },
                hideFeedback: true,
                req
              }
            );
        }else{
          return res.redirect('/unauthorized');
        }
      }
    }catch(err){nextError(next)(err);}
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
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, false, false, false);
    } else {
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        return MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, allowed, false, false);
      }).catch(nextError(next));
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
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, false, false, false);
    } else {
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
       return MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, allowed, false, false);
      }).catch(nextError(next));
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
          MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, false, true, false);
    } else {
      Map.allowedToModify(map_id, user_id)
      .then((allowed) => {
        return MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, allowed, true, false);
      }).catch(nextError(next));
    }
  });
};
