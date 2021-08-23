import Shortid from 'shortid'
import DebugService from '../../lib/debug'
import mapboxgl from 'mapbox-gl'
const debug = DebugService('map-styles-color')
type CircleLineFillLayer =
  | mapboxgl.CircleLayer
  | mapboxgl.LineLayer
  | mapboxgl.FillLayer
type LayerWithMeta = CircleLineFillLayer & {
  metatdata: any
}
export default {
  // attempt to update a style color without recreating other parts of the style
  // needed for custom style support
  updateStyleColor(
    glStyle: mapboxgl.Style,
    newColor: string
  ): {
    isOutlineOnly: boolean
    style: mapboxgl.Style
  } {
    let isOutlineOnly = false

    if (
      glStyle.layers &&
      Array.isArray(glStyle.layers) &&
      glStyle.layers.length > 0
    ) {
      // treat style as immutable and return a copy
      glStyle = JSON.parse(JSON.stringify(glStyle))
      let markerImageName
      let markerLayer
      for (const glLayer of glStyle.layers as LayerWithMeta[]) {
        const { id, type, metadata, paint } = glLayer

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
            // use a new random image name so we can get mapbox-gl to update
            markerImageName = 'marker-icon-' + Shortid.generate()

            if (metadata['maphubs:markers'].inverted) {
              metadata['maphubs:markers'].shapeStroke = newColor
              metadata['maphubs:markers'].iconFill = newColor
            } else {
              metadata['maphubs:markers'].shapeFill = newColor
            }

            metadata['maphubs:markers'].imageName = markerImageName
          }
        } else if (id.startsWith('omh-markers-')) {
          markerLayer = glLayer
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
        } else if (
          id.startsWith('omh-data-outline') &&
          metadata &&
          metadata['maphubs:outline-only']
        ) {
          isOutlineOnly = true
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
      }

      if (markerLayer) {
        markerLayer.layout['icon-image'] = markerImageName
      }
    }

    return {
      style: glStyle,
      isOutlineOnly
    }
  }
}
