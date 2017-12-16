//@flow
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style';

const AGSRaster = {
  async load(key: string, source: GLSource, mapComponent: any){

  //add directly to map until this is fixed https://github.com/mapbox/mapbox-gl-js/issues/3003
  return mapComponent.map.addSource(key, source);
  },
  addLayer(layer: GLLayer, source: GLSource, position: number, mapComponent: any){
    if(layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']){
      mapComponent.map.addLayer(layer, 'water');
    }else{
      if(mapComponent.state.editing){
        mapComponent.map.addLayer(layer, mapComponent.getFirstDrawLayerID());
      }else{
        //get layer id at position
        if(mapComponent.glStyle && 
          mapComponent.glStyle.layers && 
          Array.isArray(mapComponent.glStyle.layers) &&
            mapComponent.glStyle.layers.length >= position){
          const beforeLayerId = mapComponent.glStyle.layers[position].id;
          mapComponent.map.addLayer(layer, beforeLayerId);
        }else{
          mapComponent.map.addLayer(layer);
        }
      }      
    }
  },
  removeLayer(layer: GLLayer, mapComponent: any){
    return mapComponent.map.removeLayer(layer.id);
  },
  remove(key: string, mapComponent: any){
    return mapComponent.map.removeSource(key);
  }
};

module.exports = AGSRaster;