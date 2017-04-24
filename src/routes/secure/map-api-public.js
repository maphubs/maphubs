var Map = require('../../models/map');
var apiError = require('../../services/error-response').apiError;
var csrfProtection = require('csurf')({cookie: false});
var apiDataError = require('../../services/error-response').apiDataError;

module.exports = function(app: any) {

app.post('/api/map/info/:map_id', csrfProtection, (req, res) => {   
    if(req.body && req.body.map_id){
      var map_id = req.body.map_id;
      if (!req.isAuthenticated || !req.isAuthenticated()
      || !req.session || !req.session.user) {
      //not logged in
      Map.isPrivate(map_id).then(isPrivate=>{
        if(isPrivate){
           res.status(200).send({success: false});
           return;
        }else{
          return Map.getMap(map_id)
          .then(map=>{
            return Map.getMapLayers(map_id, false).then(layers=>{
              res.status(200).send({success: true, map, layers});
            });
          });
        }
      }).catch(apiError(res, 500));
    }else{
      //logged in
      var user_id = req.session.user.id;
      Map.isPrivate(map_id).then(isPrivate=>{
        return Map.allowedToModify(map_id, user_id)
        .then(allowed=>{
          if(isPrivate && !allowed){
            res.status(200).send({success: false});
          }else{
            return Map.getMap(map_id)
              .then(map=>{
                return Map.getMapLayers(map_id, allowed).then(layers=>{
                  res.status(200).send({success: true, map, layers});
                });
              });
          }
        });
      }).catch(apiError(res, 500));
    }
    }else{
        apiDataError(res);
    }
    
  });

};