// @flow
import type {GLStyle} from '../../../types/mapbox-gl-style'
import DebugService from '../../../services/debug'
const debug = DebugService('map-styles-color')

export default {
// attempt to update a style color without recreating other parts of the style
  // needed for custom style support
  updateStyleColor (glStyle: GLStyle, newColor: string) {
    if (glStyle.layers && Array.isArray(glStyle.layers) && glStyle.layers.length > 0) {
      // treat style as immutable and return a copy
      glStyle = JSON.parse(JSON.stringify(glStyle))

      glStyle.layers.forEach((glLayer) => {
        const {id, type, metadata, paint} = glLayer
        // patch old outline-only layers
        if (metadata && typeof metadata['maphubs:fill'] !== 'undefined') {
          metadata['maphubs:outline-only'] = !metadata['maphubs:fill']
        }

        if (id.startsWith('omh-data-point')) {
          // Maphubs Point Layer
          if (type === 'circle' && paint) {
            paint['circle-color'] = newColor
          } else {
            debug.log('unable to update point layer type: ' + type)
          }
          if (metadata && metadata['maphubs:markers']) {
            metadata['maphubs:markers'].shapeFill = newColor
          }
        } else if (id.startsWith('omh-data-line')) {
          if (type === 'line' && paint) {
            paint['line-color'] = newColor
          } else {
            debug.log('unable to update line layer type: ' + type)
          }
        } else if (id.startsWith('omh-data-polygon')) {
          if (type === 'fill' && paint) {
            paint['fill-color'] = newColor
            paint['fill-outline-color'] = newColor
          } else {
            debug.log('unable to update polygon layer type: ' + type)
          }
        } else if (id.startsWith('omh-data-outline') &&
          metadata && metadata['maphubs:outline-only']) {
          paint['line-color'] = newColor
        } else if (id.startsWith('omh-data-doublestroke-polygon')) {
          if (type === 'line' && paint) {
            paint['line-color'] = newColor
          } else {
            debug.log('unable to update line layer type: ' + type)
          }
        } else if (id.startsWith('osm') && id.endsWith('-polygon')) {
          if (type === 'fill' && paint) {
            paint['fill-color'] = newColor
          } else {
            debug.log('unable to update osm polygon layer type: ' + type)
          }
        } else if (id.startsWith('osm') && id.endsWith('-line')) {
          if (type === 'line' && paint) {
            paint['line-color'] = newColor
          } else {
            debug.log('unable to update osm line layer type: ' + type)
          }
        } else if (id === 'osm-buildings-polygon') {
          if (type === 'fill' && paint) {
            paint['fill-color'] = newColor
          } else {
            debug.log('unable to update osm building layer type: ' + type)
          }
        }
      })
    }
    return glStyle
  }
}
