import type { GLStyle } from '../../../types/mapbox-gl-style'
import _remove from 'lodash.remove'
export default {
  removeStyleLabels(style: GLStyle): GLStyle {
    if (
      style.layers &&
      Array.isArray(style.layers) &&
      style.layers.length > 0
    ) {
      // treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style))

      _remove(style.layers, (layer) => {
        return layer.id.startsWith('omh-label')
      })
    }

    return style
  },

  addStyleLabels(
    style: GLStyle,
    field: string,
    layer_id: number,
    shortid: string,
    data_type: string
  ): any {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    style = this.removeStyleLabels(style)

    if (
      style.layers &&
      Array.isArray(style.layers) &&
      style.layers.length > 0
    ) {
      let sourceLayer = 'data'
      let filter = ['in', '$type', 'Point']
      let placement = 'point'
      let translate = [0, 0]

      if (data_type === 'point') {
        translate = [0, -14]
        // if marker
        style.layers.forEach((layer) => {
          if (
            layer.id.startsWith('omh-data-point') &&
            layer.metadata &&
            layer.metadata['maphubs:markers'] &&
            layer.metadata['maphubs:markers'].enabled
          ) {
            const markerOptions = layer.metadata['maphubs:markers']
            let offset = 9

            if (
              markerOptions.shape !== 'MAP_PIN' &&
              markerOptions.shape !== 'SQUARE_PIN'
            ) {
              offset = offset + markerOptions.height / 2
            }

            translate = [0, offset]
          }
        })
      } else if (data_type === 'line') {
        placement = 'line'
        filter = ['in', '$type', 'LineString']
      } else if (data_type === 'polygon') {
        sourceLayer = 'data-centroids'
      }

      style.layers.push({
        id: `omh-label-${layer_id}-${shortid}`,
        type: 'symbol',
        source: 'omh-' + shortid,
        'source-layer': sourceLayer,
        filter,
        layout: {
          'text-font': ['Roboto Bold'],
          visibility: 'visible',
          'symbol-placement': placement,
          'text-field': '{' + field + '}',
          'text-size': {
            base: 14,
            stops: [
              [13, 14],
              [18, 14]
            ]
          }
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#FFF',
          'text-halo-width': 2,
          'text-translate': translate
        }
      })
    }

    return style
  }
}