//@flow
var exportUtils = require('../../services/export-utils');
var Layer = require('../../models/layer');
var apiError = require('../../services/error-response').apiError;
var privateLayerCheck = require('../../services/private-layer-check').check;
var manetCheck = require('../../services/manet-check');
var local = require('../../local');

module.exports = function(app: any) {

  app.get('/api/lyr/:shortid/export/json/*', (req, res) => {
      const shortid = req.params.shortid;

      var user_id = -1;
      if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
        user_id = req.session.user.maphubsUser.id;
      }
      
      Layer.isSharedInPublicMap(shortid)
      .then(isShared =>{
        return Layer.getLayerByShortID(shortid)
          .then(layer=>{
            if(local.requireLogin){
              if(
                isShared || //in public shared map
                manetCheck.check(req) || //screenshot service
                (user_id > 0 && privateLayerCheck(layer.layer_id, user_id)) //logged in and allowed to see this layer
              ){          
                return  Layer.getGeoJSON(layer.layer_id).then((geoJSON) => {
                  return res.status(200).send(geoJSON);
                });
              }else{
                return res.status(404).send();
              }
            }else{
              //only do the private layer check
              if(privateLayerCheck(layer.layer_id, user_id)){
               return  Layer.getGeoJSON(layer.layer_id).then((geoJSON) => {
                  return res.status(200).send(geoJSON);
                });
              }else{
                return res.status(404).send();
              }
            }
        });
      }).catch(apiError(res, 200));
  });

  app.get('/api/lyr/:shortid/export/geobuf/*', (req, res) => {
    const shortid = req.params.shortid;

    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }

    Layer.isSharedInPublicMap(shortid)
      .then(isShared =>{
        return Layer.getLayerByShortID(shortid)
          .then(layer=>{
             if(local.requireLogin){
              if(
                isShared || //in public shared map
                manetCheck.check(req) || //screenshot service
                (user_id > 0 && privateLayerCheck(layer.layer_id, user_id)) //logged in and allowed to see this layer
              ){                 
                return exportUtils.completeGeoBufExport(req, res, layer.layer_id);
              }else{
                return res.status(404).send();
              }
            }else{
              //only do the private layer check
              if(privateLayerCheck(layer.layer_id, user_id)){
                return exportUtils.completeGeoBufExport(req, res, layer.layer_id);
              }else{
                return res.status(404).send();
              }
            }
        });
      }).catch(apiError(res, 200));
  });
};