//@flow
var _findIndex = require('lodash.findindex');
import type {GLStyle} from '../../../types/mapbox-gl-style';

module.exports = {

   /**
    * settings set on every gl-style layer
    */
   defaultLayerSettings(){
      return {
        active: true,
        interactive: true,
        showBehindBaseMapLabels: false
      };
    },

    set(object: Object, key: string, value: any){
      if(!object) return;

      if(!object.metadata){
        object.metadata = {};
      }
      object.metadata[`maphubs:${key}`] = value;
    },

    get(object: Object, key: string): any{
      if(!object) return;
      
      if(object.metadata){
        return object.metadata[`maphubs:${key}`];
      }else{
        return null;
      }
    },

    getLayerSetting(style: GLStyle, id: string, key: string){
      let index = _findIndex(style.layers, {id});
      if(index){
        let layer = style.layers[index];
        return this.get(layer, key);
      }else{
        return null;
      }
      
    },

    getSourceSetting(style: GLStyle, id: string, key: string){
      let source = style.sources[id];
      return this.get(source, key);
    },

    setLayerSetting(style: GLStyle, id: string, key: string, value: any){
      let index = _findIndex(style.layers, {id});
      let layer = style.layers[index];
      this.set(layer, key, value);
      return style;
    },

    setSourceSetting(style: GLStyle, id: string, key: string, value: any){
      let source = style.sources[id];
      this.set(source, key, value);
      return style;
    },

    setLayerSettingAll(style: GLStyle, key: string, value: any, excludeType?: string){
      style.layers.forEach(layer => {
        if(!excludeType || layer.type !== excludeType){
          this.set(layer, key, value);
        }    
      });
    }
};