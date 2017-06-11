//@flow
var _findIndex = require('lodash.findindex');

module.exports = {

  /**
   * Settings on every gl-style source
   * Also used for shared MapHubs "layer" settings like color
   * that may apply to all gl-style layers
   */
  defaultSourceSettings(){
      return {
        mapColor: 'red',
        presets: []
      };
  },

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
      if(!object.metadata){
        object.metadata = {};
      }
      object.metadata[`maphubs:${key}`] = value;
    },

    get(object: Object, key: string): any{
      if(object.metadata){
        return object.metadata[`maphubs:${key}`];
      }else{
        return null;
      }
    },

    getLayerSetting(style: Object, id: string, key: string){
      let index = _findIndex(style.layers, {id});
      let layer = style.layers[index];
      return this.get(layer, key);
    },

    getSourceSetting(style: Object, id: string, key: string){
      let source = style[id];
      return this.get(source, key);
    },

    setLayerSetting(style: Object, id: string, key: string, value: any){
      let index = _findIndex(style.layers, {id});
      let layer = style.layers[index];
      this.set(layer, key, value);
      return style;
    },

    setSourceSetting(style: Object, id: string, key: string, value: any){
      let source = style[id];
      this.set(source, key, value);
      return style;
    },

    setLayerSettingAll(style: Object, key: string, value: any, excludeType: string){
      style.layers.forEach(layer => {
        if(layer.type !== excludeType){
          this.set(layer, key, value);
        }    
      });
    }
};