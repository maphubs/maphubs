// @flow
var Layer = require('../../models/layer');
var multer  = require('multer');
var log = require('../../services/log');
var ogr2ogr = require('ogr2ogr');
var shapefileFairy = require('../../services/shapefile-fairy');
var DataLoadUtils = require('../../services/data-load-utils');
var debug = require('../../services/debug')('routes/layers');
var local = require('../../local');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var Promise = require('bluebird');
const Importers = require('../../services/importers');
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/api/layer/:id/upload', multer({dest: local.tempFilePath + '/uploads/'}).single('file'),
   async (req, res) => {
     if (!req.isAuthenticated || !req.isAuthenticated()
         || !req.session || !req.session.user) {
       res.status(401).send("Unauthorized, user not logged in");
     }

     var user_id = req.session.user.maphubsUser.id;
     var layer_id = parseInt(req.params.id || '', 10);
     try {
      const layer = await Layer.getLayerByID(layer_id);
      if(layer){
        let shortid = layer.shortid;       
        if(layer.created_by_user_id === user_id){
          debug.log('Filename: ' +req.file.originalname);
          debug.log('Mimetype: ' +req.file.mimetype);
          const importer = Importers.getImporterFromFileName(req.file.originalname);
          const importerResult = await importer(req.file.path, layer_id);
          if(importerResult.type && importerResult.type === 'FeatureCollection'){
            //is geoJSON
            const result = await DataLoadUtils.storeTempGeoJSON(importerResult, req.file.path, layer_id, shortid, false, true);
            return res.status(200).send(result);
          }else{
            //pass through other types of results
            return res.status(200).send(importerResult);
          }  
          }else {
            return notAllowedError(res, 'layer');
          }
      }else{
        throw new Error('layer not found');
      } 
    }catch(err){
      log.error(err.message);
      //in this case allow error message to be sent to user
      apiError(res, 200, err.message)(err);
    }
  });

  app.post('/api/layer/finishupload', csrfProtection, async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.maphubsUser.id;
    if(req.body.layer_id && req.body.requestedShapefile){
      debug.log('finish upload for layer: ' + req.body.layer_id + ' requesting shapefile: ' + req.body.requestedShapefile);
      try{
        const layer = await Layer.getLayerByID(req.body.layer_id);
        const shortid = layer.shortid;
        if(layer.created_by_user_id === user_id){
          debug.log('allowed');
          //get file path
          const path = await DataLoadUtils.getTempShapeUpload(req.body.layer_id);
          debug.log("finishing upload with file: " + path);
          const shapefileFairyResult = await shapefileFairy(path, {shapefileName: req.body.requestedShapefile});
          if(shapefileFairyResult){
            var shpFilePath = path + '_zip' + '/' + req.body.requestedShapefile;

            var ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(60000);
            const geoJSON = await Promise.promisify(ogr.exec, {context: ogr})();

            let result = await DataLoadUtils.storeTempGeoJSON(geoJSON, path, req.body.layer_id, shortid, true, true);
            return res.status(200).send(result);
          }else{
            return res.status(200).send({
              success: false, 
              error: 'failed to extract shapefile'});
          }    
        }else {
          return notAllowedError(res, 'layer');
        }
      }catch(err){
        log.error(err.message);
        apiError(res, 200)(err);
      }
    }else{
      debug.log('missing required data');
      apiDataError(res);
    }
  });
};