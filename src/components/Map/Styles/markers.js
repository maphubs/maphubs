// @flow
import type {GLStyle} from '../../../types/mapbox-gl-style'
import type {Layer} from '../../../stores/layer-store'
module.exports = {
  enableMarkers (style: GLStyle, markerOptions: Object, layer: Layer) {
    if (style.layers && Array.isArray(style.layers) && style.layers.length > 0) {
      // treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style))
      let layer_id = (layer && layer.layer_id) ? layer.layer_id : ''
      const shortid = (layer && layer.shortid) ? layer.shortid : ''
      // get host from source
      let baseUrl: string = '{MAPHUBS_DOMAIN}'
      let remote_host
      if (layer.remote && layer.remote_host) {
        remote_host = layer.remote_host
        baseUrl = 'https://' + layer.remote_host
        // attempt to find remote layer id
        const keys = Object.keys(style.sources)
        if (keys && keys.length > 0) {
          const firstSource = keys[0]
          if (firstSource.startsWith('omh-')) {
            const parts = firstSource.split('-')
            const remoteLayerId = parts[1]
            layer_id = remoteLayerId
          }
        }
      }

      const dataUrl = `${baseUrl}/api/lyr/${shortid}/export/json/${shortid}.json`
      const geobufUrl = `${baseUrl}/api/lyr/${shortid}/export/geobuf/${shortid}.pbf`

      style.layers.forEach((layer) => {
        if (layer.id.startsWith('omh-data-point')) {
          let metadata = {}
          if (layer.metadata) {
            metadata = layer.metadata
          }

          if (!metadata['maphubs:markers']) {
            metadata['maphubs:markers'] = {}
          }

          metadata['maphubs:markers'] = markerOptions
          metadata['maphubs:markers'].enabled = true
          if (remote_host) {
            metadata['maphubs:markers'].remote_host = remote_host
          }
          metadata['maphubs:markers'].dataUrl = dataUrl
          metadata['maphubs:markers'].geobufUrl = geobufUrl
          metadata['maphubs:layer_id'] = layer_id
          if (metadata['maphubs:interactive']) {
            metadata['maphubs:markers'].interactive = true
          }
          metadata['maphubs:interactive'] = false // disable regular mapbox-gl interaction

          layer.metadata = metadata
        } else if (layer.id.startsWith('omh-label')) {
          // move label below marker
          if (!layer.layout) {
            layer.layout = {}
          }
          if (!layer.paint) {
            layer.paint = {}
          }
          if (!layer.layout['text-size']) {
            layer.layout['text-size'] = {}
          }

          let offset = (layer.layout['text-size'].base / 2) + layer.paint['text-halo-width']
          if (markerOptions.shape === 'MAP_PIN' || markerOptions.shape === 'SQUARE_PIN') {
            layer.paint['text-translate'][1] = offset
          } else {
            offset = offset + (markerOptions.height / 2)
          }
        } else {
          // disable all other layers
          if (!layer.layout) layer.layout = {}
          layer.layout.visibility = 'none'
        }
      })
    }
    return style
  },

  disableMarkers (style: GLStyle) {
    if (style.layers && Array.isArray(style.layers) && style.layers.length > 0) {
      // treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style))
      style.layers.forEach((layer) => {
        if (layer.id.startsWith('omh-data-point')) {
          if (!layer.metadata) {
            layer.metadata = {}
          }

          if (!layer.metadata['maphubs:markers']) {
            layer.metadata['maphubs:markers'] = {}
          }

          layer.metadata['maphubs:markers'].enabled = false

          // re-enable mapbox-gl interaction
          if (layer.metadata['maphubs:markers'].interactive) {
            layer.metadata['maphubs:interactive'] = true
          }
        } else if (layer.id.startsWith('omh-label')) {
          // restore label offset
          if (!layer.paint) {
            layer.paint = {}
          }
          if (!layer.layout) {
            layer.layout = {}
          }
          if (!layer.paint['text-translate']) {
            layer.paint['text-translate'] = [0, 0]
          }
          if (!layer.layout['text-size']) {
            layer.layout['text-size'] = {}
          }
          layer.paint['text-translate'][1] = 0 - layer.layout['text-size'].base
        } else {
          // re-enable other layers
          if (!layer.layout) layer.layout = {}
          layer.layout.visibility = 'visible'
        }
      })
    }
    return style
  }
}
