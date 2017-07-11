// @flow
var Layer = require('../../models/layer');
var multer  = require('multer');
var log = require('../../services/log');
var ogr2ogr = require('ogr2ogr');
var shapefileFairy = require('shapefile-fairy');
var csv2geojson = require('csv2geojson');
var fs = require('fs');
var unzip = require('unzip2');
var DataLoadUtils = require('../../services/data-load-utils');
var fileEncodingUtils = require('../../services/file-encoding-utils');
//var log = require('../../services/log.js');
var debug = require('../../services/debug')('routes/layers');
var _endsWith = require('lodash.endswith');
var local = require('../../local');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/api/layer/:id/upload', multer({dest: local.tempFilePath + '/uploads/'}).single('file'),
   (req, res) => {
     if (!req.isAuthenticated || !req.isAuthenticated()
         || !req.session || !req.session.user) {
       res.status(401).send("Unauthorized, user not logged in");
     }

     var user_id = req.session.user.maphubsUser.id;
     var layer_id = parseInt(req.params.id || '', 10);
     Layer.getLayerByID(layer_id)
     .then((layer) => {
       if(layer.created_by_user_id === user_id){
         debug.log('Mimetype: ' +req.file.mimetype);
         if(_endsWith(req.file.originalname, '.zip')){
           debug.log('Zip File Detected');
           fs.createReadStream(req.file.path).pipe(unzip.Extract({path: req.file.path + '_zip'}))
           .on('close', (err) => {
              if (err) throw err;
             //validate
             try {
             shapefileFairy(req.file.path, (result) => {
               debug.log('ShapefileFairy Result: ' + JSON.stringify(result));    
               if(result && result.code === 'MULTIPLESHP'){
                log.info('Multiple Shapfiles Detected: ' + result.shapefiles.toString());      
                DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
                .then(() => {
                  debug.log('Finished storing temp path');
                  //tell the client if we were successful
                  res.status(200).send({
                    success: false,
                    code: result.code,
                    shapefiles: result.shapefiles
                  });
                }).catch(apiError(res, 200));
               }else if(result){
                 debug.log('Shapefile Validation Successful');
                 var shpFilePath = req.file.path + '_zip/' + result.shp;
                 debug.log("shapefile: " + shpFilePath);
                  var ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(120000);
                  ogr.exec((er, geoJSON) => {
                    if (er){
                      log.error(er);
                      res.status(200).send({success: false, error: er});
                    }else{
                      DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
                      .then((result) => {
                        //tell the client if we were successful
                        res.status(200).send(result);
                      }).catch(apiError(res, 200));
                    }
                  });
               }else{
                 log.error(`Unknown Shapefile Validation Error`);
                 DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
                 .then(() => {
                   debug.log('Finished storing temp path');
                   //tell the client if we were successful
                   res.status(200).send({
                    success: false,
                    value: result
                  });
                 }).catch(apiError(res, 200));
               }
             },
             {extract: false});
            }catch(err){   
              res.status(200).send({
                  success: false,
                  code: err.code,
                  error: err.message
                });   
            }
          });


         } else if(_endsWith(req.file.originalname, '.geojson')
         || _endsWith(req.file.originalname, '.json')){
           debug.log('JSON File Detected');
           let data = fileEncodingUtils.getDecodedFileWithBestGuess(req.file.path);
               let geoJSON = JSON.parse(data);
               DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
               .then((result) => {
                 res.status(200).send(result);
               }).catch(apiError(res, 200)); //don't want browser to intercept the error, so we can show user a better message

         } else if(_endsWith(req.file.originalname, '.csv')){
           debug.log('CSV File Detected');
            let data = fileEncodingUtils.getDecodedFileWithBestGuess(req.file.path);

             csv2geojson.csv2geojson(data, (err, geoJSON) => {

                if (err && !geoJSON) {
                  log.error(err);
                  res.status(200).send({success: false, error: JSON.stringify(err)});
                  return;
                } else if (err) {
                    log.error(err);
                }

                if(geoJSON){
                  DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
                  .then((result) => {
                    res.status(200).send(result);
                  }).catch(apiError(res, 200));
                }else{
                  log.error("Failed to parse CSV");
                  res.status(200).send({success: false, error: "Error Reading CSV"});
                  return;
                }

            });

         } else if(_endsWith(req.file.originalname, '.gpx')){
           debug.log('GPX File Detected');
           ogr2ogr(fs.createReadStream(req.file.path), 'GPX')
           .format('GeoJSON').skipfailures()
           .options(['-t_srs', 'EPSG:4326','-sql','SELECT * FROM tracks'])
           .timeout(60000)
           .exec((er, geoJSON) => {
             if(geoJSON.features && geoJSON.features.length === 0){
               debug.log('No tracks found, loading waypoints');
               ogr2ogr(fs.createReadStream(req.file.path), 'GPX')
               .format('GeoJSON').skipfailures()
               .options(['-t_srs', 'EPSG:4326','-sql','SELECT * FROM waypoints'])
               .timeout(60000)
               .exec((er, geoJSON) => {
                 if (er){
                   log.error(er);
                   res.status(200).send({success: false, error: er.toString()});
                 }else{
                   DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
                   .then((result) => {
                     //tell the client if we were successful
                     res.status(200).send(result);
                   }).catch(apiError(res, 200));
                 }
               });
             }else{
               if(local.writeDebugData){
                 fs.writeFile(local.tempFilePath + '/gpx-upload-layer-' + layer_id + '.geojson', JSON.stringify(geoJSON), (err) => {
                   if(err) {
                     log.error(err);
                     throw err;
                   }
                 });
               }

               if (er){
                 log.error(er);
                 res.status(200).send({success: false, error: er.toString()});
               }else{
                 DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
                 .then((result) => {
                   //tell the client if we were successful
                   res.status(200).send(result);
                 }).catch(apiError(res, 500));
               }
             }


           });

         } else if(_endsWith(req.file.originalname, '.kml')){
           debug.log('KML File Detected');
           ogr2ogr(fs.createReadStream(req.file.path), 'KML')
           .format('GeoJSON').skipfailures().
           options(['-t_srs', 'EPSG:4326']).timeout(60000)
           .exec((er, geoJSON) => {
             if (er){
               log.error(er);
               res.status(200).send({success: false, error: er.toString()});
             }else{
               DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, false)
               .then((result) => {
                 //tell the client if we were successful
                 res.status(200).send(result);
               }).catch(apiError(res, 500));
             }
           });

         }else {
           debug.log('Unsupported File Type: '+ req.file.path);
           res.status(200).send({success: false, valid: false, error: "Unsupported File Type"});
         }
       }else {
         notAllowedError(res, 'layer');
       }
     });
});

app.post('/api/layer/finishupload', csrfProtection, (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()
      || !req.session || !req.session.user) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }

  var user_id = req.session.user.maphubsUser.id;
  if(req.body.layer_id && req.body.requestedShapefile){
    debug.log('finish upload for layer: ' + req.body.layer_id + ' requesting shapefile: ' + req.body.requestedShapefile);
   Layer.getLayerByID(req.body.layer_id)
     .then((layer) => {
      if(layer.created_by_user_id === user_id){
      debug.log('allowed');
      //get file path
      return DataLoadUtils.getTempShapeUpload(req.body.layer_id)
      .then((path) => {
        debug.log("finishing upload with file: " + path);
        try{
        shapefileFairy(path, (result) => {
          if(result){
            var shpFilePath = path + '_zip' + '/' + req.body.requestedShapefile;
            var ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(60000);
            ogr.exec((er, geoJSON) => {
              if (er){
                log.error(er.message);
                res.status(200).send({
                  success: false, 
                  error: er.toString()});
              }else{
                DataLoadUtils.storeTempGeoJSON(geoJSON, path, req.body.layer_id, true)
                .then((result) => {
                  //tell the client if we were successful
                  res.status(200).send(result);
                }).catch(apiError(res, 500));
              }
            });
          }else{
            res.status(200).send({
              success: false, 
              error: 'failed to extract shapefile'});
          }
        }, {shapefileName: req.body.requestedShapefile});
        }catch(err){
          log.error(err.message);
          res.status(200).send({success: false, error: err.toString()});
        }
      });
    }else {
      notAllowedError(res, 'layer');
    }
  }).catch(apiError(res, 500));
}else{
  debug.log('missing required data');
  apiDataError(res);
}

});

/*
app.get('/api/layer/tempdata/:id.geojson', function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()
      || !req.session || !req.session.user) {
    res.status(401).send("Unauthorized, user not logged in");
    return;
  }

  var user_id = req.session.user.maphubsUser.id;
  var layer_id = parseInt(req.params.id || '', 10);
  Layer.allowedToModify(layer_id, user_id)
  .then(function(allowed){
    if(allowed){
      DataLoadUtils.getTempData(layer_id)
      .then(function(result){
        res.status(200).send(result);
      }).catch(apiError(res, 500));
    } else {
      notAllowedError(res, 'layer');
    }
  }).catch(apiError(res, 500));
});
*/
};