//@flow
import type {GLLayer} from '../../../types/mapbox-gl-style';
module.exports = {
  defaultRasterStyle(layer_id: number, shortid: string, sourceUrl: string, type: string="raster"){
    return this.rasterStyleWithOpacity(layer_id, shortid, sourceUrl, 100, type);
  },

  defaultMultiRasterStyle(layer_id: number, shortid: string, layers: Array<GLLayer>, type: string="raster"){
      return this.multiRasterStyleWithOpacity(layer_id, shortid, layers, 100, type);
  },

  rasterStyleWithOpacity(layer_id: number, shortid: string, sourceUrl: string, opacity: number, type: string="raster"){

      opacity = opacity / 100;
      var style = {
          sources: {},
          layers: [
            {
            "id": "omh-raster-" + shortid,
            "type": "raster",
            "metadata":{
              "maphubs:layer_id": layer_id,
              "maphubs:globalid": shortid
            },
            "source": "omh-" + shortid,
            "minzoom": 0,
            "maxzoom": 18,
            "paint": {
              "raster-opacity": opacity
            }
            }
          ]
      };

      style.sources['omh-' + shortid] = {
          type,
          url: sourceUrl,
          "tileSize": 256

      };

      return style;
    },

  multiRasterStyleWithOpacity(layer_id: number, shortid: string, layers: Array<Object>, opacity: number, type: string="raster"){
  
      opacity = opacity / 100;
      var style = {
          sources: {},
          layers: []
      };

      layers.forEach((raster, i) => {
        var id = `omh-raster-${i}-${shortid}`;
        style.layers.push(
          {
            id,
            "type": "raster",
            "metadata":{
              "maphubs:layer_id": layer_id,
              "maphubs:globalid": shortid
            },
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