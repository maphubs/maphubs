// @flow
import type {GLStyle} from '../../../types/mapbox-gl-style'

module.exports = {
  getPolygonLayers (
    layer_id: number, shortid: string,
    color: string, hoverColor: string, hoverOutlineColor: string,
    interactive: boolean, showBehindBaseMapLabels: boolean) {
    const layers = [
      {
        'id': `omh-data-polygon-${layer_id}-${shortid}`,
        'type': 'fill',
        'metadata': {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid,
          'maphubs:interactive': interactive,
          'maphubs:showBehindBaseMapLabels': showBehindBaseMapLabels
        },
        'source': 'omh-' + shortid,
        'source-layer': '',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'fill-color': color,
          'fill-outline-color': color,
          'fill-opacity': 0.5
        }
      }, {
        'id': `omh-data-doublestroke-polygon--${layer_id}-${shortid}`,
        'type': 'line',
        'metadata': {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        'source': 'omh-' + shortid,
        'source-layer': '',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'line-color': color,
          'line-opacity': 0.3,
          'line-width': {
            'base': 0.5,
            'stops': [
              [5, 1.0],
              [6, 2.0],
              [7, 3.0],
              [8, 4.0],
              [9, 5.0],
              [10, 6.0]
            ]
          },
          'line-offset': {
            'base': 0.5,
            'stops': [
              [5, 0.5],
              [6, 1.0],
              [7, 1.5],
              [8, 2.0],
              [9, 2.5],
              [10, 3.0]
            ]
          }
        }
      }, {
        'id': `omh-data-outline-polygon-${layer_id}-${shortid}`,
        'type': 'line',
        'metadata': {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        'source': 'omh-' + shortid,
        'source-layer': '',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'line-color': '#222222',
          'line-opacity': 0.8,
          'line-width': {
            'base': 0.5,
            'stops': [
              [3, 0.1],
              [4, 0.2],
              [5, 0.3],
              [6, 0.4],
              [7, 0.5],
              [8, 0.6],
              [9, 0.7],
              [10, 0.8]
            ]
          }
        }
      },
      {
        'id': `omh-hover-polygon-${layer_id}-${shortid}`,
        'type': 'fill',
        'metadata': {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        'source': 'omh-' + shortid,
        'source-layer': '',
        'filter': ['==', 'mhid', ''],
        'paint': {
          'fill-color': hoverColor,
          'fill-outline-color': hoverOutlineColor,
          'fill-opacity': 0.7
        }
      }
    ]

    if (layer_id !== 'geojson') {
      layers.forEach((layer) => {
        layer['source-layer'] = 'data'
      })
    }
    return layers
  },

  toggleFill (style: GLStyle, fill: boolean) {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    // get color and update fill layer
    let outlineColor
    let legendColor
    let outlineWidth = {
      'base': 0.5,
      'stops': [
        [3, 0.1],
        [4, 0.2],
        [5, 0.3],
        [6, 0.4],
        [7, 0.5],
        [8, 0.6],
        [9, 0.7],
        [10, 0.8]
      ]
    }
    style.layers.forEach((layer) => {
      if (layer.type === 'fill' && layer.id.startsWith('omh-data-polygon')) {
        legendColor = layer.paint['fill-color']
        if (fill) {
          // re-enable fill
          outlineColor = '#222222'
          legendColor = layer.paint['fill-color']
          layer.paint['fill-opacity'] = 0.7
        } else {
          // remove fill
          outlineColor = layer.paint['fill-color']
          layer.paint['fill-opacity'] = 0
          outlineWidth = 3
        }
      }
    })
    // loop again just in case fill layer is out of order somehow
    style.layers.forEach((layer) => {
      if (layer.type === 'line') {
        if (layer.id.startsWith('omh-data-outline')) {
          layer.paint['line-color'] = outlineColor
          layer.paint['line-width'] = outlineWidth
        } else if (layer.id.startsWith('omh-data-doublestroke')) {
          if (!layer.layout) {
            layer.layout = {}
          }
          if (fill) {
            layer.layout.visibility = 'visible'
          } else {
            layer.layout.visibility = 'none'
          }
        }
      }
    })
    return {style, legendColor}
  }

}
