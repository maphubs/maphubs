//@flow
import type {GLLayer} from '../../../types/mapbox-gl-style';
module.exports = {
  defaultRasterStyle(layer_id: number, sourceUrl: string, type: string="raster"){
    return this.rasterStyleWithOpacity(layer_id, sourceUrl, 100, type);
  },

  defaultMultiRasterStyle(layer_id: number, layers: Array<GLLayer>, type: string="raster"){
      return this.multiRasterStyleWithOpacity(layer_id, layers, 100, type);
  },

  rasterStyleWithOpacity(layer_id: number, sourceUrl: string, opacity: number, type: string="raster"){

      opacity = opacity / 100;
      var style = {
          sources: {},
          layers: [
            {
            "id": "omh-raster-" + layer_id,
            "type": "raster",
            "source": "omh-" + layer_id,
            "minzoom": 0,
            "maxzoom": 18,
            "paint": {
              "raster-opacity": opacity
            }
            }
          ]
      };

      style.sources['omh-' + layer_id] = {
          type,
          url: sourceUrl,
          "tileSize": 256

      };

      return style;
    },

  multiRasterStyleWithOpacity(layer_id: number, layers: Array<GLLayer>, opacity: number, type: string="raster"){
  
      opacity = opacity / 100;
      var style = {
          sources: {},
          layers: []
      };

      layers.forEach((raster, i) => {
        var id = `omh-raster-${i}-${layer_id}`;
        style.layers.push(
          {
            "id": id,
            "type": "raster",
            "source": id,
            "minzoom": 0,
            "maxzoom": 18,
            "paint": {
              "raster-opacity": opacity
            }
            }
        );
        style.sources[id] = {
          type,
          tiles: raster.tiles,
          "tileSize": 256

      };
      });

      return style;
    },
};