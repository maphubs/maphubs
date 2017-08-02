// @flow
var Layer = require('../../models/layer');
var multer  = require('multer');
var log = require('../../services/log');
var ogr2ogr = require('ogr2ogr');
var shapefileFairy = require('../../services/shapefile-fairy');
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
var Promise = require('bluebird');

var csrfProtection = require('csurf')({cookie: false});

var streamCloseToPromise = function(stream){
  return new Promise((resolve, reject)=> {
        stream.on("close", resolve);
        stream.on("error", reject);
    });
};

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
       let shortid = layer.shortid;
       if(layer.created_by_user_id === user_id){
         debug.log('Mimetype: ' +req.file.mimetype);
         if(_endsWith(req.file.originalname, '.zip')){
            debug.log('Zip File Detected');
            let pipedStream = fs.createReadStream(req.file.path).pipe(unzip.Extract({path: req.file.path + '_zip'}));
            return streamCloseToPromise(pipedStream)
            .then(err=> {
                if (err) throw err;
              //validate                  
              return shapefileFairy(req.file.path, {extract: false}).then(result => {
                debug.log('ShapefileFairy Result: ' + JSON.stringify(result));    
                if(result && result.code === 'MULTIPLESHP'){  
                  log.info('Multiple Shapfiles Detected: ' + result.shapefiles.toString());      
                  return DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
                  .then(() => {
                    debug.log('Finished storing temp path');
                    //tell the client if we were successful
                    return res.status(200).send({
                      success: false,
                      code: result.code,
                      shapefiles: result.shapefiles
                    });
                  }).catch(apiError(res, 200));
                }else if(result){
                  debug.log('Shapefile Validation Successful');
                  var shpFilePath = req.file.path + '_zip/' + result.shp;
                  debug.log("shapefile: " + shpFilePath);
                    var ogr = ogr2ogr(shpFilePath)
                    .format('GeoJSON')
                    .skipfailures()
                    .options(['-t_srs', 'EPSG:4326'])
                    .timeout(120000);

                    return Promise.promisify(ogr.exec, {context: ogr})()
                    .then((geoJSON) => {
                        return DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, shortid, false)
                        .then((result) => {
                          //tell the client if we were successful
                          return res.status(200).send(result);
                        });  
                    }).catch(err=>{
                      log.error(err);
                      return res.status(200).send({success: false, error: err});
                    });
                }else{
                  log.error(`Unknown Shapefile Validation Error`);
                  return DataLoadUtils.storeTempShapeUpload(req.file.path, layer_id)
                  .then(() => {
                    debug.log('Finished storing temp path');
                    //tell the client if we were successful
                    return res.status(200).send({
                      success: false,
                      value: result
                    });
                  }).catch(apiError(res, 200));
                }
              }).catch(err=>{   
                return res.status(200).send({
                    success: false,
                    code: err.code,
                    error: err.message
                  });   
              });
          });
         } else if(_endsWith(req.file.originalname, '.geojson')
         || _endsWith(req.file.originalname, '.json')){
           debug.log('JSON File Detected');
           let data = fileEncodingUtils.getDecodedFileWithBestGuess(req.file.path);
           let geoJSON = JSON.parse(data);
           return DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, shortid, false)
          .then((result) => {
            return res.status(200).send(result);
          }).catch(apiError(res, 200)); //don't want browser to intercept the error, so we can show user a better message

         } else if(_endsWith(req.file.originalname, '.csv')){
           debug.log('CSV File Detected');
            let data = fileEncodingUtils.getDecodedFileWithBestGuess(req.file.path);
             return Promise.promisify(csv2geojson.csv2geojson, {context: csv2geojson})(data)
             .then((geoJSON) => {
                if(geoJSON){
                  return DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, shortid, false)
                  .then((result) => {
                    return res.status(200).send(result);
                  }).catch(apiError(res, 200));
                }else{
                  log.error("Failed to parse CSV");
                  return res.status(200).send({success: false, error: "Error Reading CSV"});  
                }
            }).catch(err=>{
              log.error(err);
              return res.status(200).send({success: false, error: JSON.stringify(err)});
            });
         } else if(_endsWith(req.file.originalname, '.gpx')){
           debug.log('GPX File Detected');
           let ogr = ogr2ogr(fs.createReadStream(req.file.path), 'GPX')
           .format('GeoJSON').skipfailures()
           .options(['-t_srs', 'EPSG:4326','-sql','SELECT * FROM tracks'])
           .timeout(60000);
           return Promise.promisify(ogr.exec, {context: ogr})()
           .then((geoJSON) => {
             if(geoJSON.features && geoJSON.features.length === 0){
               debug.log('No tracks found, loading waypoints');
               let ogrWaypoints = ogr2ogr(fs.createReadStream(req.file.path), 'GPX')
               .format('GeoJSON').skipfailures()
               .options(['-t_srs', 'EPSG:4326','-sql','SELECT * FROM waypoints'])
               .timeout(60000);
               return Promise.promisify(ogrWaypoints.exec)()
               .then((geoJSON) => {
                  return DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, shortid, false)
                  .then((result) => {
                    //tell the client if we were successful
                    return res.status(200).send(result);
                  }).catch(apiError(res, 200));           
               }).catch(err=>{
                 log.error(err);
                 return res.status(200).send({success: false, error: err.toString()});
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
                return DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, shortid, false)
                .then((result) => {
                  return res.status(200).send(result);
                });
              }       
           }).catch(err=>{
              log.error(err);
              return res.status(200).send({success: false, error: err.toString()});
           });
         } else if(_endsWith(req.file.originalname, '.kml')){
           debug.log('KML File Detected');
           let ogr = ogr2ogr(fs.createReadStream(req.file.path), 'KML')
           .format('GeoJSON').skipfailures().
           options(['-t_srs', 'EPSG:4326']).timeout(60000);
           return Promise.promisify(ogr.exec, {context: ogr})()
           .then((geoJSON) => {
              return DataLoadUtils.storeTempGeoJSON(geoJSON, req.file.path, layer_id, shortid, false)
              .then((result) => {
                return res.status(200).send(result);
              });
           }).catch(err=>{
            log.error(err);
            return res.status(200).send({success: false, error: err.toString()});
           });
         }else {
           debug.log('Unsupported File Type: '+ req.file.path);
           return res.status(200).send({success: false, valid: false, error: "Unsupported File Type"});
         }
       }else {
         return notAllowedError(res, 'layer');
       }
     }).catch(apiError(res, 500));
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
       let shortid = layer.shortid;
      if(layer.created_by_user_id === user_id){
      debug.log('allowed');
      //get file path
      return DataLoadUtils.getTempShapeUpload(req.body.layer_id)
      .then((path) => {
        debug.log("finishing upload with file: " + path);
        try{
        return shapefileFairy(path, {shapefileName: req.body.requestedShapefile}).then(result => {
          if(result){
            var shpFilePath = path + '_zip' + '/' + req.body.requestedShapefile;
            var ogr = ogr2ogr(shpFilePath).format('GeoJSON').skipfailures().options(['-t_srs', 'EPSG:4326']).timeout(60000);
            return Promise.promisify(ogr.exec, {context: ogr})()
            .then((geoJSON) => {  
              return DataLoadUtils.storeTempGeoJSON(geoJSON, path, req.body.layer_id, shortid, true)
              .then((result) => {
                return res.status(200).send(result);
              });  
            }).catch(err=>{
              log.error(err.message);
                return res.status(200).send({
                  success: false, 
                  error: err.toString()});
            });
          }else{
            return res.status(200).send({
              success: false, 
              error: 'failed to extract shapefile'});
          }
        });
        }catch(err){
          log.error(err.message);
          return res.status(200).send({success: false, error: err.toString()});
        }
      }).catch(apiError(res, 500));
    }else {
      return notAllowedError(res, 'layer');
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