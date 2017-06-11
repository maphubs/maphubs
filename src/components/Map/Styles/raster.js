//@flow
module.exports = {
  defaultRasterStyle(layer_id: number, sourceUrl, type="raster"){
    return this.rasterStyleWithOpacity(layer_id, sourceUrl, 100, type);
  },

  defaultMultiRasterStyle(layer_id: number, layers, type="raster"){
      return this.multiRasterStyleWithOpacity(layer_id, layers, 100, type);
  },

  rasterStyleWithOpacity(layer_id: number, sourceUrl, opacity, type="raster"){

      opacity = opacity / 100;
      var styles = {
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

      styles.sources['omh-' + layer_id] = {
          type,
          url: sourceUrl,
          "tileSize": 256

      };

      return styles;
    },

  multiRasterStyleWithOpacity(layer_id: number, layers, opacity, type="raster"){
  
      opacity = opacity / 100;
      var styles = {
          sources: {},
          layers: []
      };

      layers.forEach((raster, i) => {
        var id = `omh-raster-${i}-${layer_id}`;
        styles.layers.push(
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
        styles.sources[id] = {
          type,
          tiles: raster.tiles,
          "tileSize": 256

      };
      });

      return styles;
    },
};