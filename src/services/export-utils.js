//@flow
var Layer = require('../models/layer');
var geobuf = require('geobuf');
var Pbf = require('pbf');
var apiError = require('../services/error-response').apiError;
var version = require('../../package.json').version;
var local = require('../local');
var moment = require('moment');

module.exports = {

  completeGeoBufExport(req: any, res: any, layer_id: number){
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
       /*eslint-disable security/detect-possible-timing-attacks */
      if(hash === match){
        return res.status(304).send();
      }else{
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'ETag': hash
        });

        let data = geobuf.encode(geoJSON, new Pbf());
        var buf = Buffer.from(data, 'binary');
        return res.end(buf, 'binary');
      }
    }).catch(apiError(res, 200));
  },

  completeMapHubsExport(req: any, res: any, layer_id: number){
    Layer.getLayerByID(layer_id)
    .then(layer=>{
      return Layer.getGeoJSON(layer_id).then((geoJSON) => {
        geoJSON.maphubs = {
          version: 1,
          systemVersion: version,
          exportTime: moment().format(),
          host: local.host,
          layer
        };
        var resultStr = JSON.stringify(geoJSON);
        var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
        var match = req.get('If-None-Match');
         /*eslint-disable security/detect-possible-timing-attacks */
        if(hash === match){
          return res.status(304).send();
        }else{
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'ETag': hash
          });
  
          let data = geobuf.encode(geoJSON, new Pbf());
          var buf = Buffer.from(data, 'binary');
          return res.end(buf, 'binary');
        }
      });
    }).catch(apiError(res, 200));
    
  }
};