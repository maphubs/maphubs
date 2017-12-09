// @flow
var Layer = require('../../models/layer');
var Map = require('../../models/map');
var nextError = require('../../services/error-response').nextError;
var manetCheck = require('../../services/manet-check').middleware;
var Locales = require('../../services/locales');

module.exports = function(app: any) {
  //create a map view that we will use to screenshot the layer
  app.get('/api/layer/:layer_id/static/render/', manetCheck, (req, res, next) => {

    var layer_id = parseInt(req.params.layer_id || '', 10);
    if(!layer_id){
      return res.status(404).send();
    }
    Layer.getLayerByID(layer_id).then((layer) => {
      if(layer){
        let name = Locales.getLocaleStringObject(req.locale, layer.name);
        let title = name + ' - ' + MAPHUBS_CONFIG.productName;

        return res.render('staticmap', {title, hideFeedback: true, 
          disableGoogleAnalytics: true,
          props:{
            name,
            layers: [layer],
            position: layer.preview_position,
            basemap: 'default',
            style: layer.style,
            showLegend: false,
            insetMap: false,
            showLogo: false
          }, req
        });
      }else{
        return res.status(404).send();
      }
    }).catch(nextError(next));
  });

  let completeMapStaticRender = async function(req, res, next, map_id){
    let showLegend = true;
    if(req.query.hideLegend){
      showLegend = false;
    }

    let showLogo = true;
    if(req.query.hideLogo){
      showLogo = false;
    }

    let showScale = true;
    if(req.query.hideScale){
      showScale = false;
    }

    let showInset = true;
    if(req.query.hideInset){
      showInset = false;
    }
    try{

      const map = await Map.getMap(map_id);
      if(!map){
        return res.status(404).send();
      }else{
        const layers = await Map.getMapLayers(map_id, true);

        var title = req.__('Map');
        if(map.title){
          title = Locales.getLocaleStringObject(req.locale, map.title);
        }
        return res.render('staticmap', {
          title: title + ' - ' + MAPHUBS_CONFIG.productName, 
          hideFeedback: true,
          disableGoogleAnalytics: true,
          props:{
            name: title,
            layers,
            position: map.position,
            basemap: map.basemap,
            style: map.style,
            settings: map.settings,
            showLegend,
            showLogo,
            showScale,
            insetMap: showInset
          }, req
        });
      }
    }catch(err){nextError(next)(err);}
  };

  app.get('/api/map/:mapid/static/render/', manetCheck, async (req, res, next) => {
    var map_id = parseInt(req.params.mapid || '', 10);
    if(map_id){
      await completeMapStaticRender(req, res, next, map_id);
    }else{
      return res.status(404).send();
    }
  });

  app.get('/api/map/:mapid/static/render/thumbnail', manetCheck, async (req, res, next) => {
    try{
      var map_id = parseInt(req.params.mapid || '', 10);

      if(!map_id){
        return res.status(404).send();
      }

      const map = await Map.getMap(map_id);

      if(!map){
        return res.status(404).send();
      }else{

        const layers = await Map.getMapLayers(map_id, true);

        var title = 'Map';
        if(map.title){
          title = Locales.getLocaleStringObject(req.locale, map.title);
        }
        return res.render('staticmap', {
          title: title + ' - ' + MAPHUBS_CONFIG.productName,
          hideFeedback: true,
          disableGoogleAnalytics: true,
            props:{
              name: title,
              layers,
              position: map.position,
              basemap: map.basemap,
              style: map.style,
              showLegend: false,
              insetMap: false,
              showLogo: false
            }, req
          });
      }
    }catch(err){nextError(next)(err);}
  });
};
