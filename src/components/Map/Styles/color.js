//@flow
var debug = require('../../../services/debug')('map-styles-color');
import type {GLStyle} from '../../../types/mapbox-gl-style';

module.exports = {
//attempt to update a style color without recreating other parts of the style
  //needed for custom style support
  updateStyleColor(style: GLStyle, newColor: string){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      //treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style));
      style.layers.forEach((style) => {
        if(style.id.startsWith('omh-data-point')){
          //Maphubs Point Layer
          if(style.type === 'circle' && style.paint){
            style.paint['circle-color'] = newColor;
          }else{
            debug.log('unable to update point layer type: ' + style.type);
          }
          if(style.metadata && style.metadata['maphubs:markers']){
            style.metadata['maphubs:markers'].shapeFill = newColor;
          }
        }else if(style.id.startsWith('omh-data-line')){
          if(style.type === 'line' && style.paint){
            style.paint['line-color'] = newColor;
          }else{
            debug.log('unable to update line layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-polygon')){
          if(style.type === 'fill'){
            //flow was glitching here, requiring a check for each line
            if(style.paint) style.paint['fill-color'] = newColor;           
            if(style.paint) style.paint['fill-outline-color'] = newColor;
            if(style.paint) style.paint['fill-opacity'] = 1;
          }else{
            debug.log('unable to update polygon layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-doublestroke-polygon')){
          if(style.type === 'line' && style.paint){
            style.paint['line-color'] = newColor;
          }else{
            debug.log('unable to update line layer type: ' + style.type);
          }
        }else if(style.id.startsWith('osm') && style.id.endsWith('-polygon')){
          if(style.type === 'fill' && style.paint){
            style.paint['fill-color'] = newColor;
          }else{
            debug.log('unable to update osm polygon layer type: ' + style.type);
          }
        }else if(style.id.startsWith('osm') && style.id.endsWith('-line')){
          if(style.type === 'line' && style.paint){
            style.paint['line-color'] = newColor;
          }else{
            debug.log('unable to update osm line layer type: ' + style.type);
          }
        }else if(style.id === 'osm-buildings-polygon'){
          if(style.type === 'fill' && style.paint){
            style.paint['fill-color'] = newColor;
          }else{
            debug.log('unable to update osm building layer type: ' + style.type);
          }
        }

      });
    }
    return style;
  },
};