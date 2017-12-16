//@flow
const nextError = require('../../services/error-response').nextError;
const Map = require('../../models/map');
const Stats = require('../../models/stats');
const MapUtils = require('../../services/map-utils');
const ScreenshotUtils = require('../../services/screenshot-utils');
const apiError = require('../../services/error-response').apiError;
const apiDataError = require('../../services/error-response').apiDataError;

module.exports = function(app: any) {

  const recordMapView = function(session: Object, map_id: number, user_id: number,  next: any){
    if(!session.mapviews){
      session.mapviews = {};
    }
    if(!session.mapviews[map_id]){
      session.mapviews[map_id] = 1;
      Stats.addMapView(map_id, user_id).catch(nextError(next));
    }else{
      const views = session.mapviews[map_id];

      session.mapviews[map_id] = views + 1;
    }

    session.views = (session.views || 0) + 1;
  };


  app.get('/map/share/:share_id', (req, res, next) => {

    const share_id = req.params.share_id;

    let user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }

    Map.getMapByShareId(share_id).then(map => {
      if(map){
        const map_id = map.map_id;
        recordMapView(req.session, map_id, user_id, next);
        if(!req.isAuthenticated || !req.isAuthenticated()
          || !req.session || !req.session.user) {
          return MapUtils.completeUserMapRequest(req, res, next, map_id, false, true);
        } else {
          //get user id
          return Map.allowedToModify(map_id, user_id)
          .then((allowed) => {
            return MapUtils.completeUserMapRequest(req, res, next, map_id, allowed, true);
          });
        }
      }else{
        return res.redirect('/notfound?path='+req.path);
      }     
    }).catch(nextError(next));
  });

  app.get('/api/map/share/screenshot/:share_id.png', (req, res) => {
    const share_id = req.params.share_id;
    
    Map.getMapByShareId(share_id).then(map => {
      if(map){
        const map_id = map.map_id;
        return ScreenshotUtils.getMapImage(map_id)
        .then((image) => {
          return ScreenshotUtils.returnImage(image, 'image/png', req, res);
        });
      }else {
        return res.status(404).send();
      }
    }).catch(apiError(res, 500));
  });

  app.get('/map/public-embed/:share_id', (req, res, next) => {
    const share_id = req.params.share_id;
    if(!share_id){
      apiDataError(res);
    }

    let user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
     Map.getMapByShareId(share_id).then(map => {
      if(map){
        const map_id = map.map_id;
        recordMapView(req.session, map_id, user_id, next);

        if (!req.isAuthenticated || !req.isAuthenticated()
            || !req.session || !req.session.user) {
             return MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, false, false, true);
        } else {
          return Map.allowedToModify(map_id, user_id)
          .then((allowed) => {
            return MapUtils.completeEmbedMapRequest(req, res, next, map_id, false, allowed, false, true);
          }).catch(nextError(next));
        }
      }else{
        return res.redirect('/notfound?path='+req.path);
      }     
    }).catch(nextError(next));
  });

  app.get('/map/public-embed/:share_id/static', (req, res, next) => {
    const share_id = req.params.share_id;
    if(!share_id){
      apiDataError(res);
    }

    let user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
     Map.getMapByShareId(share_id).then(map => {
      if(map){
        const map_id = map.map_id;
        recordMapView(req.session, map_id, user_id, next);

        if (!req.isAuthenticated || !req.isAuthenticated()
            || !req.session || !req.session.user) {
              return MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, false, false, true);
        } else {
          return Map.allowedToModify(map_id, user_id)
          .then((allowed) => {
          return MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, allowed, false, true);
          }).catch(nextError(next));
        }
       }else{
        return res.redirect('/notfound?path='+req.path);
      }     
    }).catch(nextError(next));
  });

  app.get('/map/public-embed/:share_id/interactive', (req, res, next) => {
    const share_id = req.params.share_id;
    if(!share_id){
      apiDataError(res);
    }

    let user_id = -1;
    if(req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    Map.getMapByShareId(share_id).then(map => {
      if(map){
        const map_id = map.map_id;
        recordMapView(req.session, map_id, user_id, next);

        if (!req.isAuthenticated || !req.isAuthenticated()
            || !req.session || !req.session.user) {
              return MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, false, true, true);
        } else {
          return Map.allowedToModify(map_id, user_id)
          .then((allowed) => {
            return MapUtils.completeEmbedMapRequest(req, res, next, map_id, true, allowed, true, true);
          }).catch(nextError(next));
        }
      }else{
        return res.redirect('/notfound?path='+req.path);
      }     
    }).catch(nextError(next));
  });
};