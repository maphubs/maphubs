//@flow
import type {GLStyle} from '../../../types/mapbox-gl-style';
module.exports = {
 enableMarkers(style: GLStyle, markerOptions: Object, layer_id: number){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      style.layers.forEach((layer) => {
        if(layer.id.startsWith('omh-data-point')){
          if(!layer.metadata){
            layer.metadata = {};
          }
          
          layer.metadata['maphubs:markers'] = markerOptions;
          layer.metadata['maphubs:markers'].enabled = true;
          layer.metadata['maphubs:markers'].dataUrl = '{MAPHUBS_DOMAIN}/api/layer/'+ layer_id + '/export/json/'+ layer_id + '.json';
          layer.metadata['maphubs:layer_id'] = layer_id;
          if(layer.metadata["maphubs:interactive"]){
            layer.metadata['maphubs:markers'].interactive = true;
          }
          layer.metadata["maphubs:interactive"] = false; //disable regular mapbox-gl interaction


        }else if(layer.id.startsWith('omh-label')){
          //move label below marker
           var offset = (layer.layout['text-size'].base / 2) + layer.paint['text-halo-width'];
          if(markerOptions.shape === 'MAP_PIN' || markerOptions.shape === 'SQUARE_PIN'){         
             layer.paint['text-translate'][1] = offset;
          }else{
            offset = offset + (markerOptions.height / 2);
          }
        }else{
          //disable all other layers
          if(!layer.layout) layer.layout = {};
          layer.layout.visibility = 'none';
        }
      });
    }
    return style;
  },

  disableMarkers(style: GLStyle){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      style.layers.forEach((layer) => {
        if(layer.id.startsWith('omh-data-point')){

          layer.metadata['maphubs:markers'].enabled = false;  

          //re-enable mapbox-gl interaction
          if(layer.metadata["maphubs:markers"].interactive){
            layer.metadata['maphubs:interactive'] = true;
          }

        }else if(layer.id.startsWith('omh-label')){
          //restore label offset
          layer.paint['text-translate'][1] = 0 - layer.layout['text-size'].base;
        }else{
          //re-enable other layers
          if(!layer.layout) layer.layout = {};
          layer.layout.visibility = 'visible';
        }
      });
    }
    return style;
  }
};