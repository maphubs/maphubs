//@flow
var log = require('../../services/log');
var unzip = require('unzip2');
var DataLoadUtils = require('../data-load-utils');
var Promise = require('bluebird');
var fs = require('fs');
var ogr2ogr = require('ogr2ogr');
var shapefileFairy = require('../shapefile-fairy');
var debug = require('../debug')('services/importers/shapefile');

var streamCloseToPromise = function(stream){
  return new Promise((resolve, reject)=> {
    stream.on("close", resolve);
    stream.on("error", reject);
  });
};

module.exports = async function(filePath: string, layer_id: number){
  /*eslint-disable security/detect-non-literal-fs-filename*/
  //file path is a folder from a env var + a GUID, not orginal filename
  let pipedStream = fs.createReadStream(filePath).pipe(unzip.Extract({path: filePath + '_zip'}));
  await streamCloseToPromise(pipedStream);              
  //validate                  
  const result = await shapefileFairy(filePath, {extract: false});
  debug.log('ShapefileFairy Result: ' + JSON.stringify(result));    
  if(result && result.code === 'MULTIPLESHP'){  
      log.info('Multiple Shapfiles Detected: ' + result.shapefiles.toString());      
      await DataLoadUtils.storeTempShapeUpload(filePath, layer_id);
      debug.log('Finished storing temp path');
      //tell the client if we were successful
      return {
        success: false,
        code: result.code,
        shapefiles: result.shapefiles
      };
  }else if(result){
    debug.log('Shapefile Validation Successful');
    var shpFilePath = filePath + '_zip/' + result.shp;
    debug.log("shapefile: " + shpFilePath);
    var ogr = ogr2ogr(shpFilePath)
    .format('GeoJSON')
    .skipfailures()
    .options(['-t_srs', 'EPSG:4326'])
    .timeout(120000);

    const geoJSON = await Promise.promisify(ogr.exec, {context: ogr})();  
    return geoJSON;
    }else{
      log.error(`Unknown Shapefile Validation Error`);
      await DataLoadUtils.storeTempShapeUpload(filePath, layer_id);
      debug.log('Finished storing temp path');           
      return {
        success: false,
        value: result
      };
    }

};