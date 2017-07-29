//@flow
var nextError = require('../../services/error-response').nextError;
var Map = require('../../models/map');
var Stats = require('../../models/stats');
var MapUtils = require('../../services/map-utils');

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
          return MapUtils.completeUserMapRequest(req, res, next, map_id, false);
        } else {
          //get user id
          return Map.allowedToModify(map_id, user_id)
          .then((allowed) => {
            return MapUtils.completeUserMapRequest(req, res, next, map_id, allowed);
          });
        }
      }else{
        return res.redirect('/notfound?path='+req.path);
      }     
    }).catch(nextError(next));
  });
};