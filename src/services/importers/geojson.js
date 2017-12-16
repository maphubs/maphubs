//@flow
const fileEncodingUtils = require('../file-encoding-utils');
const debug = require('../debug')('services/importers/geojson');

module.exports = async function(filePath: string, layer_id: number){
  debug.log(`importing GeoJSON for layer: ${layer_id}`);
  const data = fileEncodingUtils.getDecodedFileWithBestGuess(filePath);
  const geoJSON = JSON.parse(data);
  return geoJSON;
};