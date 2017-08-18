//@flow
var fileEncodingUtils = require('../file-encoding-utils');
var debug = require('../debug')('services/importers/geojson');

module.exports = async function(filePath: string, layer_id: number){
  debug.log(`importing GeoJSON for layer: ${layer_id}`);
  let data = fileEncodingUtils.getDecodedFileWithBestGuess(filePath);
  let geoJSON = JSON.parse(data);
  return geoJSON;
};