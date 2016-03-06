/* @flow weak */

var log = require('../services/log.js');
var Changeset = require('../services/changeset');
var passport = require('passport');
var knex = require('../connection.js');
var Layer = require('../models/layer');
var LayerViews = require('../services/layer-views');
var Presets = require('../services/preset-utils');
//var log = require('../services/log.js');
var apiError = require('../services/error-response').apiError;
var notAllowedError = require('../services/error-response').notAllowedError;


function upload(req, res) {


  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }
  // Use changeset in request body.
  var changeset = req.body.osmchange;

  if (!changeset) {
    log.error('cannot parse request body');
      res.status(400).send({error: "Problem reading changeset"});
  }

  var user_id = req.session.user.id;
  var changesetID = parseInt(req.params.id || '', 10);
  var layer_id = parseInt(changeset.layerid);

  if (!user_id) {
      res.status(400).send({error: "User not found"});
      return;
  }

  if (!changesetID || isNaN(changesetID)) {
     res.status(400).send({error: "Changeset ID must be a non-zero number"});
     return;
  }

  if (!layer_id || isNaN(layer_id)) {
     res.status(400).send({error: "Layer ID not found"});
     return;
  }



    knex.transaction(function(trx) {
      //Confirm that the session user is allowed to modify this layer_id
      return Layer.allowedToModify(layer_id, user_id, trx)
      .then(function(allowed){
        if(allowed){
          return Changeset.processChangeset(changesetID, user_id, layer_id, changeset, trx)
          .then(function(result){
            return Presets.updatePresets(layer_id, user_id, trx)
            .then(function(){
            return Layer.getLayerByID(layer_id, trx)
              .then(function(layer){
                //Update layer views
                return LayerViews.replaceViews(layer_id, layer.presets, trx)
                .then(function(){
                  //Mark layer as updated (tells vector tile service to reload)
                  return trx('omh.layers').update(
                    {
                      updated_by_user_id: user_id,
                      last_updated: knex.raw('now()')
                    }
                  ).where({layer_id})
                  .then(function(){
                    res.status(200).send(result);
                  });
                });
              });
            });
          });
        }else{
          notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    }).catch(apiError(res, 500));
}

module.exports = function(app) {
  app.post('/changeset/:id/upload', passport.authenticate('token', {session: true}), upload);
};
