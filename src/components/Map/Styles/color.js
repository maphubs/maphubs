//@flow
var debug = require('../../../services/debug')('map-styles-color');

module.exports = {
//attempt to update a style color without recreating other parts of the style
  //needed for custom style support
  updateStyleColor(style: Object, newColor: string){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      style.layers.forEach((style) => {
        if(style.id.startsWith('omh-data-point')){
          //Maphubs Point Layer
          if(style.type === 'circle'){
            style.paint['circle-color'] = newColor;
          }else{
            debug('unable to update point layer type: ' + style.type);
          }
          if(style.metadata['maphubs:markers']){
            style.metadata['maphubs:markers'].shapeFill = newColor;
          }
        }else if(style.id.startsWith('omh-data-line')){
          if(style.type === 'line'){
            style.paint['line-color'] = newColor;
          }else{
            debug('unable to update line layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-polygon')){
          if(style.type === 'fill'){
            style.paint['fill-color'] = newColor;
            style.paint['fill-outline-color'] = newColor;
            style.paint['fill-opacity'] = 1;
          }else{
            debug('unable to update polygon layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-doublestroke-polygon')){
          if(style.type === 'line'){
            style.paint['line-color'] = newColor;
          }else{
            debug('unable to update line layer type: ' + style.type);
          }
        }else if(style.id.startsWith('osm') && style.id.endsWith('-polygon')){
          if(style.type === 'fill'){
            style.paint['fill-color'] = newColor;
          }else{
            debug('unable to update osm polygon layer type: ' + style.type);
          }
        }else if(style.id.startsWith('osm') && style.id.endsWith('-line')){
          if(style.type === 'line'){
            style.paint['line-color'] = newColor;
          }else{
            debug('unable to update osm line layer type: ' + style.type);
          }
        }else if(style.id === 'osm-buildings-polygon'){
          if(style.type === 'fill'){
            style.paint['fill-color'] = newColor;
          }else{
            debug('unable to update osm building layer type: ' + style.type);
          }
        }

      });
    }
    return style;
  },
};