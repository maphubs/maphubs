//@flow
var Layer = require('../models/layer');
var geobuf = require('geobuf');
var Pbf = require('pbf');
var apiError = require('../services/error-response').apiError;
module.exports = {

  completeGeoBufExport(req: any, res: any, layer_id: number){
    Layer.getGeoJSON(layer_id).then((geoJSON) => {
      var resultStr = JSON.stringify(geoJSON);
      var hash = require('crypto').createHash('md5').update(resultStr).digest("hex");
      var match = req.get('If-None-Match');
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
  }
};