//@flow
var Layer = require('../../models/layer');
var LayerData = require('../../models/layer-data');
var csrfProtection = require('csurf')({cookie: false});
var knex = require('../../connection.js');
var Promise = require('bluebird');
var debug = require('../../services/debug')('routes/layer-data');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;

module.exports = function(app: any) {

 app.post('/api/edits/save', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.maphubsUser.id;

    var data = req.body;
    if(data && data.layer_id && data.edits){
       Layer.allowedToModify(data.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return knex.transaction(trx => {
            var updates = [];
            data.edits.forEach(edit => {
              if(edit.status === 'create'){
                updates.push(LayerData.createFeature(data.layer_id, edit.geojson, trx));
              }else if(edit.status === 'modify'){
                updates.push(LayerData.updateFeature(data.layer_id, edit.geojson.id, edit.geojson, trx));
              }else if(edit.status === 'delete'){
                updates.push(LayerData.deleteFeature(data.layer_id, edit.geojson.id, trx));
              }
            });
            return Promise.all(updates).then(()=>{
              return Layer.setUpdated(data.layer_id, user_id, trx).then(()=>{
                debug('save edits complete');
                res.status(200).send({success: true});
              });
            });
          });
          }else{
            notAllowedError(res, 'layer');
          }
    }).catch(apiError(res, 500));      
  }else{
    apiDataError(res);
  }
});
 
};