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
var isAuthenticated = require('../../services/auth-check');

module.exports = function(app: any) {

  app.post('/api/edits/save', csrfProtection, isAuthenticated, async (req, res) => {
    try{
      var data = req.body;
      if(data && data.layer_id && data.edits){
        if(await Layer.allowedToModify(data.layer_id, req.user_id)){
          return knex.transaction(async (trx) => {
            await Promise.map(data.edits, (edit)=>{
              if(edit.status === 'create'){
                return LayerData.createFeature(data.layer_id, edit.geojson, trx);
              }else if(edit.status === 'modify'){
                return LayerData.updateFeature(data.layer_id, edit.geojson.id, edit.geojson, trx);
              }else if(edit.status === 'delete'){
                return LayerData.deleteFeature(data.layer_id, edit.geojson.id, trx);
              }
            });
            await Layer.setUpdated(data.layer_id, req.user_id, trx);
            debug.log('save edits complete');
            return res.status(200).send({success: true});
          });
        }else{
          return notAllowedError(res, 'layer');
        } 
      }else{
        apiDataError(res);
      }
    }catch(err){apiError(res, 500)(err);}
  });
};