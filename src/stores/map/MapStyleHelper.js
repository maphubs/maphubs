var _forEachRight = require('lodash.foreachright');
var debug = require('../../services/debug')('stores/map/MapStyleHelper');

module.exports = {
  buildMapStyle(layers: Array<Layer>){
     var mapStyle = {
       sources: {},
       layers: []
     };

     //reverse the order for the styles, since the map draws them in the order recieved
     _forEachRight(layers, (layer: Layer) => {
       var style = layer.style;
       if(style && style.sources && style.layers){
         //check for active flag and update visibility in style
         if(layer.settings && typeof layer.settings.active === 'undefined'){
           //default to on if no state provided
           layer.settings.active = true;
         }
         if(layer.settings && !layer.settings.active){
           //hide style layers for this layer
           style.layers.forEach((styleLayer) => {
             if(!styleLayer['layout']){
               styleLayer['layout'] = {};
             }
             styleLayer['layout']['visibility'] = 'none';
           });
         } else {
           //reset all the style layers to visible
           style.layers.forEach((styleLayer) => {
             if(!styleLayer['layout']){
               styleLayer['layout'] = {};
             }
             styleLayer['layout']['visibility'] = 'visible';
           });
         }
         //add source
         mapStyle.sources = Object.assign(mapStyle.sources, style.sources);
         //add layers
         mapStyle.layers = mapStyle.layers.concat(style.layers);
       } else {
         let id =layer.layer_id ? layer.layer_id : 'unknown';
         debug('Not added to map, incomplete style for layer: ' +  id);
       }

     });

     return mapStyle;
   }
};