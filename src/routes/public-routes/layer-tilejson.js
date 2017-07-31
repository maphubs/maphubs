var Layer = require('../../models/layer');
var urlUtil = require('../../services/url-util');
import slugify from 'slugify';
var apiError = require('../../services/error-response').apiError;
var manetCheck = require('../../services/manet-check');
var privateLayerCheck = require('../../services/private-layer-check').check;
var Locales = require('../../services/locales');

/*
Note: this needs to be in public-routes since it is used by the screenshot service and by shared maps
*/

module.exports = function(app) {

  let completeLayerTileJSONRequest = function(req, res, layer) {
    if(!layer){
      return res.status(404).send("TileJSON not supported for this layer");
    }
    var baseUrl = urlUtil.getBaseUrl();
    let name = Locales.getLocaleStringObject(req.locale, layer.name);
      let description = Locales.getLocaleStringObject(req.locale, layer.description); 
      let source = Locales.getLocaleStringObject(req.locale, layer.source);       
      let legend = layer.legend_html ?  layer.legend_html : name;

      if(layer.is_external && layer.external_layer_config.type === 'raster'){
        let bounds = [ -180, -85.05112877980659, 180, 85.0511287798066 ];
        if(layer.external_layer_config.bounds){
          bounds = layer.external_layer_config.bounds;
        }else if(layer.extent_bbox){
          bounds = layer.extent_bbox;
        } 
        let minzoom = layer.external_layer_config.minzoom ? parseInt(layer.external_layer_config.minzoom) : 0;
        let maxzoom = layer.external_layer_config.maxzoom ? parseInt(layer.external_layer_config.maxzoom) : 19;

        let centerZoom = Math.floor((maxzoom - minzoom) / 2);
        let centerX = Math.floor((bounds[2] - bounds[0]) / 2);
        let centerY = Math.floor((bounds[3] - bounds[1]) / 2);
        let legend = layer.legend_html ?  layer.legend_html : name;

        let tileJSON = {
          attribution: source,
          autoscale: true,
          bounds,
          center: [centerX, centerY, centerZoom],
          created: layer.last_updated,
          description,
          legend,
          filesize: 0,
          id: 'omh-' + layer.layer_id,
          maxzoom,
          minzoom,
          name,
          private: layer.private,
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: layer.external_layer_config.tiles,
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
        };
        return res.status(200).send(tileJSON);
      }else if(layer.is_external && layer.external_layer_config.type === 'vector'){
        let bounds = [ -180, -85.05112877980659, 180, 85.0511287798066 ];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        let minzoom = layer.external_layer_config.minzoom ? parseInt(layer.external_layer_config.minzoom) : 0;
        let maxzoom = layer.external_layer_config.maxzoom ? parseInt(layer.external_layer_config.maxzoom) : 19;

        let centerZoom = Math.floor((maxzoom - minzoom) / 2);
        let centerX = Math.floor((bounds[2] - bounds[0]) / 2);
        let centerY = Math.floor((bounds[3] - bounds[1]) / 2);

        let tileJSON = {
          attribution: source,
          bounds,
          center: [centerX, centerY, centerZoom],
          created: layer.last_updated,
          updated: layer.last_updated,
          description,
          legend,
          format: "pbf",
          id: 'omh-' + layer.layer_id,
          group_id: layer.owned_by_group_id,
          maxzoom,
          minzoom,
          name,
          private: layer.private,
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: layer.external_layer_config.tiles,
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
        };
        return res.status(200).send(tileJSON);
      }else if(!layer.is_external){
        let bounds = [ -180, -85.05112877980659, 180, 85.0511287798066 ];
        if(layer.extent_bbox) bounds = layer.extent_bbox;
        let minzoom = 0;
        let maxzoom = 19;

        let centerZoom = Math.floor((maxzoom - minzoom) / 2);
        let centerX = Math.floor((bounds[2] - bounds[0]) / 2);
        let centerY = Math.floor((bounds[3] - bounds[1]) / 2);

        let  uri = MAPHUBS_CONFIG.tileServiceUrl + '/tiles/lyr/' + layer.shortid + '/{z}/{x}/{y}.pbf';

        let tileJSON = {
          attribution: source,
          bounds,
          center: [centerX, centerY, centerZoom],
          created: layer.last_updated,
          updated: layer.last_updated,
          description,
          legend,
          format: "pbf",
          id: 'omh-' + layer.layer_id,
          group_id: layer.owned_by_group_id,
          maxzoom,
          minzoom,
          name,
          private: layer.private,
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: [uri],
          data: baseUrl + '/api/layer/' + layer.layer_id + '/export/json/' + slugify(name) + '.geojson',
          webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
        };
        return res.status(200).send(tileJSON);
      }else {
        return res.status(404).send("TileJSON not supported for this layer");
      }
  };
  
  app.get('/api/layer/:layer_id/tile.json', (req, res) => {

    const layer_id = parseInt(req.params.layer_id || '', 10);

     var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    
    Layer.getLayerByID(layer_id)
    .then((layer) => {
      if(manetCheck.check(req) || //screenshot service
        (user_id > 0 && privateLayerCheck(layer.layer_id, user_id)) //logged in and allowed to see this layer
      ){          
        return completeLayerTileJSONRequest(req, res, layer);
      }else{
        return res.status(404).send();
      } 
    }).catch(apiError(res, 500));
  });

  app.get('/api/lyr/:shortid/tile.json', (req, res) => {

    const shortid = req.params.shortid;

    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }

    Layer.isSharedInPublicMap(shortid)
      .then(isShared =>{
        return Layer.getLayerByShortID(shortid)
          .then(layer=>{
            if(isShared || //in public shared map
              manetCheck.check(req) || //screenshot service
              (user_id > 0 && privateLayerCheck(layer.layer_id, user_id)) //logged in and allowed to see this layer
            ){          
              return completeLayerTileJSONRequest(req, res, layer);
            }else{
              return res.status(404).send();
            }
        });
      }).catch(apiError(res, 200));
  });
};
