/* @flow weak */
var Feature = require('../models/feature');
var Layer = require('../models/layer');

//var log = require('../services/log.js');
//var debug = require('../services/debug')('routes/features');

var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;

module.exports = function(app) {


  app.get('/feature/:layer_id/:osm_id/*', function(req, res, next) {

    var osm_id = parseInt(req.params.osm_id || '', 10);
    var layer_id = parseInt(req.params.layer_id || '', 10);

    var user_id = null;
    if(req.session.user){
      user_id = req.session.user.id;
    }

    if(osm_id && layer_id){
      Feature.getFeatureByID(osm_id, layer_id)
      .then(function(results){
        var feature = results.feature;
        var notes = null;
        if(results.notes && results.notes.notes){
          notes = results.notes.notes;
        }
        var featureName = "Feature";
        if(feature.geojson.features.length > 0 && feature.geojson.features[0].properties){
          var geoJSONProps = feature.geojson.features[0].properties;
          if(geoJSONProps.name) {
            featureName = geoJSONProps.name;
          }
        }
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          res.render('featureinfo',
          {
            title: featureName + ' - MapHubs',
            fontawesome: true,
            props: {feature, notes, canEdit: false},
             req
           });
        }else{
          Layer.allowedToModify(layer_id, user_id)
          .then(function(allowed){
            if(allowed){
              res.render('featureinfo',
              {
                title: featureName + ' - MapHubs',
                fontawesome: true,
                props: {feature, notes, canEdit: true}, req
              });
            }
            else{
              res.render('featureinfo',
              {
                title: featureName + ' - MapHubs',
                fontawesome: true,
                props: {feature, notes, canEdit: false},
                 req
               });
            }
        });
      }
      }).catch(nextError(next));
    }else{
      next(new Error('Missing Required Data'));
    }

  });


  app.post('/api/feature/notes/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.layer_id && data.osm_id && data.notes) {
      Layer.allowedToModify(data.layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          Feature.saveFeatureNote(data.osm_id, data.layer_id, user_id, data.notes)
            .then(function() {
              res.send({success: true});
            }).catch(apiError(res, 500));
        }else {
          notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });


};
