//@flow
import urlUtil from '../../../services/url-util';
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style';


var RasterSource = {
  async load(key: string, source: GLSource, mapComponent: any){
   //nothing to do
   if(source.url){
    source.url = source.url.replace('{MAPHUBS_DOMAIN}', urlUtil.getBaseUrl());
  }
  return mapComponent.addSource(key, source);
  },
  addLayer(layer: GLLayer, source: GLSource, position: number, mapComponent: any){
    if(layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']){
      mapComponent.addLayerBefore(layer, 'water');
    }else{
      if(mapComponent.state.editing){
        mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID());
      }else{
        mapComponent.addLayer(layer, position);
      }      
    }
  },
  removeLayer(layer: GLLayer, mapComponent: any){
    return mapComponent.removeLayer(layer);
  },
  remove(key: string, mapComponent: any){
    return mapComponent.removeSource(key);
  }
};

module.exports = RasterSource;