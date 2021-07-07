import _findIndex from 'lodash.findindex'
import mapboxgl from 'mapbox-gl'
export default {
  /**
   * settings set on every gl-style layer
   */
  defaultLayerSettings(): {
    active: boolean
    fill: boolean
    interactive: boolean
    showBehindBaseMapLabels: boolean
  } {
    return {
      active: true,
      interactive: true,
      showBehindBaseMapLabels: false,
      fill: true
    }
  },

  set(object: Record<string, any>, key: string, value: any): any | void {
    if (!object) return
    // treat style as immutable and return a copy
    object = JSON.parse(JSON.stringify(object))

    if (!object.metadata) {
      object.metadata = {}
    }

    object.metadata[`maphubs:${key}`] = value
    return object
  },

  get(object: Record<string, any>, key: string): any {
    if (!object) return
    // treat style as immutable and return a copy
    object = JSON.parse(JSON.stringify(object))

    return object.metadata ? object.metadata[`maphubs:${key}`] : null
  },

  getLayerSetting(style: mapboxgl.Style, id: string, key: string): null {
    const index = _findIndex(style.layers, {
      id
    })

    if (typeof index !== 'undefined') {
      const layer = style.layers[index]
      return this.get(layer, key)
    } else {
      return null
    }
  },

  getSourceSetting(style: mapboxgl.Style, id: string, key: string): any {
    const source = style.sources[id]
    return this.get(source, key)
  },

  setLayerSetting(
    style: mapboxgl.Style,
    id: string,
    key: string,
    value: any
  ): any {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))

    const index = _findIndex(style.layers, {
      id
    })

    let layer = style.layers[index]
    layer = this.set(layer, key, value)
    style.layers[index] = layer
    return style
  },

  setSourceSetting(
    style: mapboxgl.Style,
    id: string,
    key: string,
    value: any
  ): any {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    let source = style.sources[id]
    source = this.set(source, key, value)
    style.sources[id] = source
    return style
  },

  setLayerSettingAll(
    style: mapboxgl.Style,
    key: string,
    value: any,
    excludeType?: string
  ): any {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    style.layers = style.layers.map((layer) => {
      if (!excludeType || layer.type !== excludeType) {
        layer = this.set(layer, key, value)
      }

      return layer
    })
    return style
  }
}
