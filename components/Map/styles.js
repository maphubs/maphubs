var debug = require('../../services/debug')('map-styles');
var _remove = require('lodash.remove');

module.exports = {


  //attempt to update a style color without recreating other parts of the style
  //needed for custom style support
  updateStyleColor(style, newColor){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      style.layers.forEach(function(style){
        if(style.id.startsWith('omh-data-point')){
          //Maphubs Point Layer
          if(style.type == 'circle'){
            style.paint['circle-color'] = newColor;
          }else{
            debug('unable to update point layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-line')){
          if(style.type == 'line'){
            style.paint['line-color'] = newColor;
          }else{
            debug('unable to update line layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-polygon')){
          if(style.type == 'fill'){
            style.paint['fill-color'] = newColor;
            style.paint['fill-outline-color'] = newColor;
          }else{
            debug('unable to update polygon layer type: ' + style.type);
          }
        }else if(style.id.startsWith('omh-data-doublestroke-polygon')){
          if(style.type == 'line'){
            style.paint['line-color'] = newColor;
          }else{
            debug('unable to update line layer type: ' + style.type);
          }
        }else if(style.id.startsWith('osm') && style.id.endsWith('-polygon')){
          if(style.type == 'fill'){
            style.paint['fill-color'] = newColor;
          }else{
            debug('unable to update osm polygon layer type: ' + style.type);
          }
        }else if(style.id.startsWith('osm') && style.id.endsWith('-line')){
          if(style.type == 'line'){
            style.paint['line-color'] = newColor;
          }else{
            debug('unable to update osm line layer type: ' + style.type);
          }
        }else if(style.id == 'osm-buildings-polygon'){
          if(style.type == 'fill'){
            style.paint['fill-color'] = newColor;
          }else{
            debug('unable to update osm building layer type: ' + style.type);
          }
        }

      });
    }
    return style;
  },

   removeStyleLabels(style){
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      _remove(style.layers, function(layer) {
        return layer.id.startsWith('omh-label');
      });
    }
    return style;
  },

  addStyleLabels(style, field, layer_id, data_type){
    style = this.removeStyleLabels(style);
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){

      var sourceLayer = "data";
      var filter = ["in","$type","Point"];
      var placement = "point";
      var translate =  [0,0];

      if(data_type == 'point'){
        translate = [0, -14];
      }else if(data_type == 'line'){
        placement = "line";
        filter = ["in", "$type", "LineString"];
      }else if(data_type == 'polygon'){
        sourceLayer = "data-centroids";
      }
      style.layers.push({
        "id": "omh-label-" + layer_id,
        "type": "symbol",
        "interactive": false,
        "source": "omh-" + layer_id,
        "source-layer": sourceLayer,
        "filter": filter,
        "layout": {
          "text-font": [
            "Arial Unicode MS Regular"
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
  },

  getPointLayers(layer_id, color, hoverColor){

    var layers = [
      {
        "id": "omh-data-point-" + layer_id,
        "type": "circle",
        "interactive": true,
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Point"],
        "paint": {
          "circle-color": color,
          "circle-opacity": 0.5
        }
      },
      {
        "id": "omh-hover-point-" + layer_id,
        "type": "circle",
        "interactive": false,
        "source": "omh-" + layer_id,
        "filter": ["==", "osm_id", ""],
        "paint": {
          "circle-radius": 15,
          "circle-color": hoverColor,
          "circle-opacity": 0.5
        },
        "paint.selected": {
          "circle-radius": 15,
          "circle-color": hoverColor,
          "circle-opacity": 0.5
        }
      }
    ];

    if(layer_id !== 'geojson'){
      layers.forEach(function(layer){
        layer["source-layer"] = "data";
      });
    }
    return layers;
  },

  getLineLayers(layer_id, color, hoverColor){

    var layers = [
      {
        "id": "omh-data-line-" + layer_id,
        "type": "line",
        "interactive": true,
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "LineString"],
        "paint": {
          "line-color": color,
          "line-opacity": 0.5,
          "line-width": 2
        }
      },
      {
        "id": "omh-hover-line-" + layer_id,
        "type": "line",
        "interactive": false,
        "source": "omh-" + layer_id,
        "filter": ["==", "osm_id", ""],
        "paint": {
          "line-color": hoverColor,
          "line-opacity": 0.3,
          "line-width": 1
        },
        "paint.selected": {
          "line-color": hoverColor,
          "line-opacity": 0.3,
          "line-width": 1
        }
      }
    ];

    if(layer_id !== 'geojson'){
      layers.forEach(function(layer){
        layer["source-layer"] = "data";
      });
    }
    return layers;
  },

  getPolygonLayers(layer_id, color, hoverColor, hoverOutlineColor){

    var layers = [
      {
        "id": "omh-data-polygon-" + layer_id,
        "type": "fill",
        "interactive": true,
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "fill-color": color,
          "fill-outline-color": color,
          "fill-opacity": 0.5
        }
      }, {
        "id": "omh-data-doublestroke-polygon-" + layer_id,
        "type": "line",
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "line-color": color,
          "line-opacity": 0.3,
          "line-width": {
            "base": 0.5,
            "stops": [
              [5, 1.0],
              [6, 2.0],
              [7, 3.0],
              [8, 4.0],
              [9, 5.0],
              [10, 6.0]
            ]
          },
          "line-offset": {
            "base": 0.5,
            "stops": [
              [5, 0.5],
              [6, 1.0],
              [7, 1.5],
              [8, 2.0],
              [9, 2.5],
              [10, 3.0]
            ]
          }
        }
      }, {
        "id": "omh-data-outline-polygon-" + layer_id,
        "type": "line",
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "line-color": "#222222",
          "line-opacity": 0.8,
          "line-width": {
            "base": 0.5,
            "stops": [
              [3, 0.1],
              [4, 0.2],
              [5, 0.3],
              [6, 0.4],
              [7, 0.5],
              [8, 0.6],
              [9, 0.7],
              [10, 0.8]
            ]
          }
        }
      },
      {
      "id": "omh-hover-polygon-" + layer_id,
      "type": "fill",
      "interactive": false,
      "source": "omh-" + layer_id,
      "filter": ["==", "osm_id", ""],
      "paint": {
        "fill-color": hoverColor,
        "fill-outline-color": hoverOutlineColor,
        "fill-opacity": 0.7
      },
      "paint.selected": {
        "fill-color": hoverColor,
        "fill-outline-color": hoverOutlineColor,
        "fill-opacity": 0.7
      }
    }
    ];

    if(layer_id !== 'geojson'){
      layers.forEach(function(layer){
        layer["source-layer"] = "data";
      });
    }
    return layers;
  },

  styleWithColor(layer_id, source, color, selectedColors, dataType=null) {

      //TODO: make default selected colors better match user color
      var hoverColor = "yellow";
      var hoverOutlineColor = "black";
      if (selectedColors) {
        hoverColor = selectedColors.hover;
        hoverOutlineColor = selectedColors.hoverOutline;
      }
      var layers = [];
      if(dataType === 'point'){
        layers = this.getPointLayers(layer_id, color, hoverColor);
      }else if(dataType === 'point'){
        layers = this.getLineLayers(layer_id, color, hoverColor);
      }else if(dataType === 'polygon'){
        layers = this.getPolygonLayers(layer_id, color, hoverColor, hoverOutlineColor);
      }else{
        layers = this.getPointLayers(layer_id, color, hoverColor)
        .concat(this.getLineLayers(layer_id, color, hoverColor))
        .concat(this.getPolygonLayers(layer_id, color, hoverColor, hoverOutlineColor));
      }

      var styles = {
          sources: {},
          layers
      };

      if(source){
        if(source.type === 'vector'){
          var url = MAPHUBS_CONFIG.tileServiceUrl + '/tiles/layer/' + layer_id + '/index.json';

          styles.sources['omh-' + layer_id] = {
            "type": "vector",
             url
          };
        }else if(source.type === 'ags-mapserver-query'
        || source.type === 'ags-featureserver-query'){
          styles.sources['omh-' + layer_id] = {
            "type": source.type,
             url: source.url
          };
        }else if(source.type === 'ags-mapserver-tiles'){
          styles.sources['omh-' + layer_id] = {
            "type": "arcgisraster",
             url: source.url + '?f=json'
          };
        }

      }

      return styles;
    },


    rasterStyleWithOpacity(layer_id, sourceUrl, opacity, type="raster"){

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

    defaultRasterStyle(layer_id, sourceUrl, type="raster"){
      return this.rasterStyleWithOpacity(layer_id, sourceUrl, 100, type);

    },

    legendWithColor(layer, color) {
      var html = '';
      if(layer.data_type == 'point'){
        html = `<div class="omh-legend">
 <div class="point double-stroke" style="background-color: ` + color + `">
 </div>
 <h3>` + layer.name + `</h3>
 </div>
`;

      }else if(layer.data_type  == 'line'){
        html = `<div class="omh-legend">
<div class="block double-stroke" style="height:  4px; background-color: ` + color + `">
</div>
<h3>` + layer.name + `</h3>
</div>`;

      }else if(layer.data_type  == 'polygon'){
        html = `<div class="omh-legend">
 <div class="block double-stroke" style="background-color: ` + color + `">
 </div>
 <h3>` + layer.name + `</h3>
 </div>
`;
     }else {
       html = `<div class="omh-legend">
 <div class="block double-stroke" style="background-color: ` + color + `">
 </div>
 <h3>` + layer.name + `</h3>
 </div>
`;
     }
      return html;
    },

    defaultLegend(layer) {
      return this.legendWithColor(layer, "red");
    },

    rasterLegend(layer) {
      var html = `<div class="omh-legend">\n<h3>` + layer.name + `</h3>\n</div>`;
      return html;
    },

    defaultStyle(layer_id, source, dataType) {
      return this.styleWithColor(layer_id, source, "red", dataType);
    },

    getMapboxStyle(mapboxid){

      //Note: we are treating a mapbox style as a special type of "source"
      //it will be converted to sources and layers when the map loads by downloading the style json from the Mapbox API
      var style = {
          sources: {},
          layers: [{
            id: 'mapbox-style-placeholder',
            type: 'mapbox-style-placeholder'
          }
          ]
      };

      style.sources[mapboxid] = {
        type: 'mapbox-style',
        mapboxid
      };

      return style;
    }

};
