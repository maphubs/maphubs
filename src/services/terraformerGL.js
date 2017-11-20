/* @flow weak */
var request = require('superagent');
var debug = require('./debug')('terraformerGL');
var arcgis = require('terraformer-arcgis-parser');

var jsonp = require('superagent-jsonp');
import _bbox from '@turf/bbox';

//tools to map ArcGIS data to geoJSON for MapboxGL

module.exports= {


  getArcGISGeoJSON(url){
    var _this = this;
    return _this.getArcGISJSON(url)
      .then((data) => {
        var geoJSON = _this.convertAGSData(data);
        var bbox = _bbox(geoJSON);
        debug.log(bbox);
        geoJSON.bbox = bbox;
        return geoJSON;
      });
  },

  getArcGISJSON(url){
    var queryStr = 'query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outSR=4326&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json';
    if(!url.endsWith('/')){
      url = url + '/';
    }
    return request.get(url + queryStr)
    .use(jsonp)
    .type('json').accept('json')
    .then((res) => {
      return res.body;
    });
  },

  getArcGISFeatureServiceGeoJSON(url){
    var queryStr = 'query?where=1%3D1&outSR=4326&f=geojson';
    if(!url.endsWith('/')){
      url = url + '/';
    }
    return request.get(url + queryStr)
    .use(jsonp)
    .type('json').accept('json')
    .then((res) => {
      var geoJSON = res.body;
      var bbox = _bbox(geoJSON);
      debug.log(bbox);
      geoJSON.bbox = bbox;
      return geoJSON;
    });
  },

  //http://gis.stackexchange.com/a/107660/14089
  convertAGSData(data){
    var FeatureCollection = {
      type: "FeatureCollection",
      features: []
    };

    for (var i = 0; i < data.features.length; i++) {
      var feature = arcgis.parse(data.features[i]);
      feature.id = i;
      FeatureCollection.features.push(feature);
    }
    return FeatureCollection;
  }



};
