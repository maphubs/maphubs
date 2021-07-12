import mapboxgl from 'mapbox-gl'

export default {
  getPolygonLayers(
    layer_id: number,
    shortid: string,
    color: string,
    hoverColor: string,
    hoverOutlineColor: string,
    interactive: boolean,
    showBehindBaseMapLabels: boolean
  ): Array<mapboxgl.FillLayer | mapboxgl.LineLayer> {
    return [
      {
        id: `omh-data-polygon-${layer_id}-${shortid}`,
        type: 'fill',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid,
          'maphubs:interactive': interactive,
          'maphubs:showBehindBaseMapLabels': showBehindBaseMapLabels
        },
        source: 'omh-' + shortid,
        'source-layer': 'data',
        filter: ['in', '$type', 'Polygon'],
        paint: {
          'fill-color': color,
          'fill-outline-color': color,
          'fill-opacity': 1
        }
      },
      {
        id: `omh-data-doublestroke-polygon-${layer_id}-${shortid}`,
        type: 'line',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        source: 'omh-' + shortid,
        'source-layer': 'data',
        filter: ['in', '$type', 'Polygon'],
        paint: {
          'line-color': color,
          'line-opacity': 0.3,
          'line-width': {
            base: 0.5,
            stops: [
              [5, 1],
              [6, 2],
              [7, 3],
              [8, 4],
              [9, 5],
              [10, 6]
            ]
          },
          'line-offset': {
            base: 0.5,
            stops: [
              [5, 0.5],
              [6, 1],
              [7, 1.5],
              [8, 2],
              [9, 2.5],
              [10, 3]
            ]
          }
        },
        layout: {
          visibility: 'none'
        }
      },
      {
        id: `omh-data-outline-polygon-${layer_id}-${shortid}`,
        type: 'line',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        source: 'omh-' + shortid,
        'source-layer': 'data',
        filter: ['in', '$type', 'Polygon'],
        paint: {
          'line-color': '#222222',
          'line-opacity': 0.8,
          'line-width': {
            base: 0.5,
            stops: [
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
        id: `omh-hover-polygon-${layer_id}-${shortid}`,
        type: 'fill',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        source: 'omh-' + shortid,
        'source-layer': 'data',
        filter: ['==', 'mhid', ''],
        paint: {
          'fill-color': hoverColor,
          'fill-outline-color': hoverOutlineColor,
          'fill-opacity': 0.7
        }
      }
    ]
  },

  toggleFill(
    style: mapboxgl.Style,
    fill: boolean
  ): {
    legendColor: string
    style: mapboxgl.Style
  } {
    // treat style as immutable and return a copy
    style = JSON.parse(JSON.stringify(style))
    // get color and update fill layer
    let outlineColor
    let legendColor
    let outlineWidth: number | { base: number; stops: [number, number][] } = {
      base: 0.5,
      stops: [
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
    for (const layer of style.layers as Array<
      mapboxgl.FillLayer | mapboxgl.LineLayer
    >) {
      const { id, type, metadata, paint } = layer

      // clear old outline-only settings
      if (metadata && typeof metadata.fill !== 'undefined') {
        delete metadata.fill
      }

      if (type === 'fill' && id.startsWith('omh-data-polygon')) {
        legendColor = paint['fill-color']

        if (fill) {
          // re-enable fill
          outlineColor = '#222222'
          paint['fill-opacity'] = 0.7
        } else {
          // remove fill
          outlineColor = paint['fill-color']
          paint['fill-opacity'] = 0
          outlineWidth = 3
        }
      }
    }
    // loop again just in case fill layer is out of order somehow
    for (const layer of style.layers as Array<
      mapboxgl.FillLayer | mapboxgl.LineLayer
    >) {
      const { id, type, paint } = layer
      let { layout } = layer

      if (type === 'line') {
        if (id.startsWith('omh-data-outline')) {
          paint['line-color'] = outlineColor
          paint['line-width'] = outlineWidth
        } else if (id.startsWith('omh-data-doublestroke')) {
          if (!layout) {
            layout = {}
          }

          layout.visibility = fill ? 'visible' : 'none'
        }
      }
    }
    return {
      style,
      legendColor
    }
  }
}
