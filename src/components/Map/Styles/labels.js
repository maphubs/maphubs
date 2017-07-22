//@flow
var _remove = require('lodash.remove');
import type {GLStyle} from '../../../types/mapbox-gl-style';

module.exports = {
   removeStyleLabels(style: GLStyle){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      //treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style));
      _remove(style.layers, (layer) => {
        return layer.id.startsWith('omh-label');
      });
    }
    return style;
  },

  addStyleLabels(style: GLStyle, field: string, layer_id: number, data_type: string){
    //treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style));
    style = this.removeStyleLabels(style);
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){

      var sourceLayer = "data";
      var filter = ["in","$type","Point"];
      var placement = "point";
      var translate =  [0,0];

      if(data_type === 'point'){

        translate = [0, -14];

        //if marker
        style.layers.forEach((layer) => {
          if(layer.id.startsWith('omh-data-point')
              && layer.metadata && layer.metadata['maphubs:markers'] 
              && layer.metadata['maphubs:markers'].enabled){
            var markerOptions = layer.metadata['maphubs:markers'];
            var offset = 9;
              if(markerOptions.shape !== 'MAP_PIN' && markerOptions.shape !== 'SQUARE_PIN'){         
                offset = offset + (markerOptions.height / 2);
              }
              translate = [0, offset];
          }
        });

      }else if(data_type === 'line'){
        placement = "line";
        filter = ["in", "$type", "LineString"];
      }else if(data_type === 'polygon'){
        sourceLayer = "data-centroids";
      }
      style.layers.push({
        "id": "omh-label-" + layer_id,
        "type": "symbol",
        "source": "omh-" + layer_id,
        "source-layer": sourceLayer,
        "filter": filter,
        "layout": {
          "text-font": [
            "Roboto Bold"
          ],
          "visibility": "visible",
          "symbol-placement": placement,
          "text-field": "{" + field + "}",
          "text-size": {
            "base": 14,
            "stops": [
              [
                13,
                14
              ],
              [
                18,
                14
              ]
            ]
          }
        },
        "paint": {
          "text-color": "#000",
          "text-halo-color": "#FFF",
          "text-halo-width": 2,
          "text-translate": translate
        }
      });
    }
    return style;
  }
};