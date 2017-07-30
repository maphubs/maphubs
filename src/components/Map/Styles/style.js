//@flow
import Settings from './settings';
import Line from './line';
import Point from './point';
import Polygon from './polygon';
var _forEachRight = require('lodash.foreachright');
var debug = require('../../../services/debug')('MapStyles/style');
import type {Layer} from '../../../stores/layer-store';
import type {GLStyle, GLSource} from '../../../types/mapbox-gl-style';

module.exports = {
  defaultStyle(layer_id: number,  shortid: string, source: GLSource, dataType: string): GLStyle {
    var settings = Settings.defaultLayerSettings();
    return this.styleWithColor(layer_id, shortid, source, "red", dataType, settings.interactive, settings.showBehindBaseMapLabels);
  },

  styleWithColor(
    layer_id: number, 
    shortid: string,
    source: GLSource, color: string, dataType: string, 
    interactive: boolean, showBehindBaseMapLabels: boolean): GLStyle {
    //TODO: make default selected colors better match user color
    var hoverColor = "yellow";
    var hoverOutlineColor = "black";

    var layers = [];
    if(dataType === 'point'){
      layers = Point.getPointLayers(layer_id, color, hoverColor, interactive, showBehindBaseMapLabels);
    }else if(dataType === 'point'){
      layers = Line.getLineLayers(layer_id, color, hoverColor, interactive, showBehindBaseMapLabels);
    }else if(dataType === 'polygon'){
      layers = Polygon.getPolygonLayers(layer_id, color, hoverColor, hoverOutlineColor, interactive, showBehindBaseMapLabels);
    }else{
      layers = Point.getPointLayers(layer_id, color, hoverColor, interactive, showBehindBaseMapLabels)
      .concat(Line.getLineLayers(layer_id, color, hoverColor, interactive, showBehindBaseMapLabels))
      .concat(Polygon.getPolygonLayers(layer_id, color, hoverColor, hoverOutlineColor, interactive, showBehindBaseMapLabels));
    }

    var styles = {
        version: 8,
        sources: {},
        layers
    };

    if(source){
      if(source.type === 'vector'){
        var url = '{MAPHUBS_DOMAIN}/api/lyr/' + shortid + '/tile.json';

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
      }else if(source.type === 'geojson'){
        styles.sources['omh-' + layer_id] = {
          "type": "geojson",
          "data": source.data
        };
        styles.layers.map(layer =>{
          delete layer['source-layer'];
        });
      }
    }
    return styles;
  },

  getMapboxStyle(mapboxid: string): GLStyle{

      //Note: we are treating a mapbox style as a special type of "source"
      //it will be converted to sources and layers when the map loads by downloading the style json from the Mapbox API
      var style: GLStyle = {
          version: 8,
          sources: {
          },
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
    },

    buildMapStyle(layers: Array<Layer>){
     var mapStyle: GLStyle = {
       version: 8,
       sources: {},
       layers: []
     };

     //reverse the order for the styles, since the map draws them in the order recieved
     _forEachRight(layers, (layer: Layer) => {
       let style = layer.style;
       if(style && style.sources && style.layers){
        //add source
        mapStyle.sources = Object.assign(mapStyle.sources, style.sources);
        //add layers
        mapStyle.layers = mapStyle.layers.concat(style.layers);
      } else {
        if(layer && layer.layer_id){
          debug.log(`Not added to map, incomplete style for layer: ${layer.layer_id}`);
        }       
      }
    });
    return mapStyle;
   }
};