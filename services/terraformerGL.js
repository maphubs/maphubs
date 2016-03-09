/* @flow weak */
var request = require('superagent-bluebird-promise');
var debug = require('./debug')('terraformerGL');
var arcgis = require('terraformer-arcgis-parser');

var jsonp = require('superagent-jsonp');

//tools to map ArcGIS data to geoJSON for MapboxGL

module.exports= {


  getArcGISGeoJSON(url){
    var _this = this;
    return _this.getArcGISJSON(url)
      .then(function(data){
        var geoJSON = _this.convertAGSData(data);
        var extent = require('turf-extent')(geoJSON);
        debug(extent);
        geoJSON.bbox = extent;
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
    .then(function(res) {
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
    .then(function(res) {
      var geoJSON = res.body;
      var extent = require('turf-extent')(geoJSON);
      debug(extent);
      geoJSON.bbox = extent;
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
