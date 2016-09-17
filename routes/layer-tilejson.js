var Layer = require('../models/layer');
var urlUtil = require('../services/url-util');
var config = require('../clientconfig');
var slug = require('slug');
var apiError = require('../services/error-response').apiError;

module.exports = function(app) {

app.get('/api/layer/:id/tile.json', function(req, res) {

    var layer_id = parseInt(req.params.id || '', 10);
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);

    Layer.getLayerByID(layer_id)
    .then(function(layer){
      if(layer.is_external && layer.external_layer_config.type == 'raster'){
        var bounds = [-180, -180, 180, 180];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        var tileJSON = {
          attribution: layer.source,
          autoscale: true,
          bounds,
          center: [0, 0, 3],
          created: layer.last_updated,
          description: layer.description,
          filesize: 0,
          format: "png8:m=h:c=64",
          id: 'omh-' + layer.layer_id,
          maxzoom: 19,
          minzoom: 0,
          name: layer.name,
          private: false,
          scheme: "xyz",
          source: "",
          tilejson: "2.0.0",
          tiles: layer.external_layer_config.tiles,
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
        };
        res.status(200).send(tileJSON);
      }else {
        res.status(404).send("TileJSON not supported for this layer");
      }
    }).catch(apiError(res, 500));

});

};
