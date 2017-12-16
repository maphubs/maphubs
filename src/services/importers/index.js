//@flow
const csv = require('./csv');
const shapefile = require('./shapefile');
const kml = require('./kml');
const geojson = require('./geojson');
const gpx = require('./gpx');
const geobuf = require('./geobuf');
const _endsWith = require('lodash.endswith');
const debug = require('../debug')('services/importers');

module.exports = {
  csv,
  shapefile,
  kml,
  geojson,
  gpx,
  geobuf,
  getImporterFromFileName(fileName: string){
    if(_endsWith(fileName, '.zip')){
      debug.log('Zip File Detected');
      return shapefile;
    }else if(_endsWith(fileName, '.pbf')){
      debug.log('Geobuf File Detected');
      return geobuf;
    }else if(_endsWith(fileName, '.maphubs')){
      debug.log('MapHubs File Detected');
      return geobuf;
    }else if(_endsWith(fileName, '.csv')){
      debug.log('CSV File Detected');
      return csv;
    }else if(_endsWith(fileName, '.kml')){
      debug.log('KML File Detected');
      return kml;
    }else if(_endsWith(fileName, '.gpx')){
      debug.log('GPX File Detected');
      return gpx;
    }else if(_endsWith(fileName, '.geojson') || _endsWith(fileName, '.json')){
      debug.log('GeoJSON File Detected');
      return geojson;
    }else if(_endsWith(fileName, '.shp')){
      throw new Error('Shapefile must uploaded in a Zip file');
    }else{
      throw new Error(`Unsupported file type: ${fileName}`);
    }
  }
};