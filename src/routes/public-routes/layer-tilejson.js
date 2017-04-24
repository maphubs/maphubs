var Layer = require('../../models/layer');
var urlUtil = require('../../services/url-util');
var slug = require('slug');
var apiError = require('../../services/error-response').apiError;
var manetCheck = require('../../services/manet-check')(false,true);

module.exports = function(app) {

app.get('/api/layer/:layer_id/tile.json', manetCheck, (req, res) => {

    var layer_id = parseInt(req.params.layer_id || '', 10);
    var baseUrl = urlUtil.getBaseUrl();

    Layer.getLayerByID(layer_id)
    .then((layer) => {
      if(layer.is_external && layer.external_layer_config.type == 'raster'){
        let bounds = [ -180, -85.05112877980659, 180, 85.0511287798066 ];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        let minzoom = layer.external_layer_config.minzoom ? parseInt(layer.external_layer_config.minzoom) : 0;
        let maxzoom = layer.external_layer_config.maxzoom ? parseInt(layer.external_layer_config.maxzoom) : 19;

        let centerZoom = Math.floor((maxzoom - minzoom) / 2);
        let centerX = Math.floor((bounds[2] - bounds[0]) / 2);
        let centerY = Math.floor((bounds[3] - bounds[1]) / 2);

        let legend = layer.legend_html ?  layer.legend_html : layer.name;

        let tileJSON = {
          attribution: layer.source,
          autoscale: true,
          bounds,
          center: [centerX, centerY, centerZoom],
          created: layer.last_updated,
          description: layer.description,
          legend,
          filesize: 0,
          format: "png8:m=h:c=64",
          id: 'omh-' + layer.layer_id,
          maxzoom,
          minzoom,
          name: layer.name,
          private: layer.private,
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: layer.external_layer_config.tiles,
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
        };
        res.status(200).send(tileJSON);
      }else if(layer.is_external && layer.external_layer_config.type == 'vector'){
        let bounds = [ -180, -85.05112877980659, 180, 85.0511287798066 ];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        let minzoom = layer.external_layer_config.minzoom ? parseInt(layer.external_layer_config.minzoom) : 0;
        let maxzoom = layer.external_layer_config.maxzoom ? parseInt(layer.external_layer_config.maxzoom) : 19;

        let centerZoom = Math.floor((maxzoom - minzoom) / 2);
        let centerX = Math.floor((bounds[2] - bounds[0]) / 2);
        let centerY = Math.floor((bounds[3] - bounds[1]) / 2);

        let legend = layer.legend_html ?  layer.legend_html : layer.name;

        let tileJSON = {
          attribution: layer.source,
          bounds,
          center: [centerX, centerY, centerZoom],
          created: layer.last_updated,
          updated: layer.last_updated,
          description: layer.description,
          legend,
          format: "pbf",
          id: 'omh-' + layer.layer_id,
          group_id: layer.owned_by_group_id,
          maxzoom,
          minzoom,
          name: layer.name,
          private: layer.private,
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: layer.external_layer_config.tiles,
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
        };
        res.status(200).send(tileJSON);
      }else if(!layer.is_external){
        let bounds = [ -180, -85.05112877980659, 180, 85.0511287798066 ];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        let minzoom = 0;
        let maxzoom = 9;

        let centerZoom = Math.floor((maxzoom - minzoom) / 2);
        let centerX = Math.floor((bounds[2] - bounds[0]) / 2);
        let centerY = Math.floor((bounds[3] - bounds[1]) / 2);

        let legend = layer.legend_html ?  layer.legend_html : layer.name;

        let  uri = MAPHUBS_CONFIG.tileServiceUrl + '/tiles/layer/' + layer.layer_id + '/{z}/{x}/{y}.pbf';

        let tileJSON = {
          attribution: layer.source,
          bounds,
          center: [centerX, centerY, centerZoom],
          created: layer.last_updated,
          updated: layer.last_updated,
          description: layer.description,
          legend,
          format: "pbf",
          id: 'omh-' + layer.layer_id,
          group_id: layer.owned_by_group_id,
          maxzoom,
          minzoom,
          name: layer.name,
          private: layer.private,
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: [uri],
          data: baseUrl + '/api/layer/' + layer.layer_id + '/export/json/' + + slug(layer.name) + '.geojson',
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
        };
        res.status(200).send(tileJSON);
      }else {
        res.status(404).send("TileJSON not supported for this layer");
      }
    }).catch(apiError(res, 500));
});
};
