import _remove from 'lodash.remove'
import mapboxgl from 'mapbox-gl'

type LayerWithMeta = mapboxgl.CircleLayer & {
  metatdata: any
}
export default {
  removeStyleLabels(style: mapboxgl.Style): mapboxgl.Style {
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
    style: mapboxgl.Style,
    field: string,
    layer_id: number,
    shortid: string,
    data_type: string
  ): mapboxgl.Style {
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
      let placement: mapboxgl.SymbolLayout['symbol-placement'] = 'point'
      let translate = [0, 0]

      switch (data_type) {
        case 'point': {
          translate = [0, -14]
          // if marker
          for (const layer of style.layers as LayerWithMeta[]) {
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
          }

          break
        }
        case 'line': {
          placement = 'line'
          filter = ['in', '$type', 'LineString']

          break
        }
        case 'polygon': {
          sourceLayer = 'data-centroids'

          break
        }
        // No default
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
