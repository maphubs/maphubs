//@flow
import type {GLStyle} from '../../../types/mapbox-gl-style';
import Settings from './settings';
import Line from './line';
import Point from './point';
import Polygon from './polygon';
module.exports = {
  defaultStyle(layer_id: number, source: string, dataType: string): GLStyle {
    var settings = Settings.defaultLayerSettings();
    return this.styleWithColor(layer_id, source, "red", dataType, settings.interactive, settings.showBehindBaseMapLabels);
  },

  styleWithColor(
    layer_id: number, 
    source: string, color: string, dataType: string, 
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
        var url = '{MAPHUBS_DOMAIN}/api/layer/' + layer_id + '/tile.json';

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
    }

    
};