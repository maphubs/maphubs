// @flow
import type {GLStyle} from '../../../types/mapbox-gl-style'
const _findIndex = require('lodash.findindex')

module.exports = {

  /**
    * settings set on every gl-style layer
    */
  defaultLayerSettings () {
    return {
      active: true,
      interactive: true,
      showBehindBaseMapLabels: false,
      fill: true
    }
  },

  set (object: Object, key: string, value: any) {
    if (!object) return
    // treat style as immutable and return a copy
    object = JSON.parse(JSON.stringify(object))

    if (!object.metadata) {
      object.metadata = {}
    }
    object.metadata[`maphubs:${key}`] = value
    return object
  },

  get (object: Object, key: string): any {
    if (!object) return
    // treat style as immutable and return a copy
    object = JSON.parse(JSON.stringify(object))

    if (object.metadata) {
      return object.metadata[`maphubs:${key}`]
    } else {
      return undefined
    }
  },

  getLayerSetting (style: GLStyle, id: string, key: string) {
    const index = _findIndex(style.layers, {id})
    if (typeof index !== 'undefined') {
      const layer = style.layers[index]
      return this.get(layer, key)
    } else {
      return undefined
    }
  },

  getSourceSetting (style: GLStyle, id: string, key: string) {
    const source = style.sources[id]
    return this.get(source, key)
  },

  setLayerSetting (style: GLStyle, id: string, key: string, value: any) {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    const index = _findIndex(style.layers, {id})
    let layer = style.layers[index]
    layer = this.set(layer, key, value)
    style.layers[index] = layer
    return style
  },

  setSourceSetting (style: GLStyle, id: string, key: string, value: any) {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    let source = style.sources[id]
    source = this.set(source, key, value)
    style.sources[id] = source
    return style
  },

  setLayerSettingAll (style: GLStyle, key: string, value: any, excludeType?: string) {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    style.layers = style.layers.map(layer => {
      if (!excludeType || layer.type !== excludeType) {
        layer = this.set(layer, key, value)
      }
      return layer
    })
    return style
  }
}
