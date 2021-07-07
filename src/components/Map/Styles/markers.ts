import mapboxgl from 'mapbox-gl'
import Shortid from 'shortid'
import type { Layer } from '../../../types/layer'
export default {
  enableMarkers(
    style: mapboxgl.Style,
    markerOptions: Record<string, any>,
    layer: Layer
  ): mapboxgl.Style {
    if (
      style.layers &&
      Array.isArray(style.layers) &&
      style.layers.length > 0
    ) {
      // treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style))
      const imageName = 'marker-icon-' + Shortid.generate()
      let metadata = {}
      let pointLayer
      let existingMarkerLayer
      for (const layer of style.layers) {
        if (layer.id.startsWith('omh-markers-')) {
          existingMarkerLayer = layer
          existingMarkerLayer.layout['icon-image'] = imageName
          existingMarkerLayer.layout.visibility = 'visible'
        } else if (layer.id.startsWith('omh-data-point')) {
          pointLayer = layer

          if (layer.metadata) {
            metadata = layer.metadata
          }

          if (!metadata['maphubs:markers']) {
            metadata['maphubs:markers'] = {}
          }

          metadata['maphubs:markers'] = markerOptions
          metadata['maphubs:markers'].enabled = true
          metadata['maphubs:markers'].version = 2
          metadata['maphubs:markers'].imageName = imageName
          metadata['maphubs:interactive'] = false // disable regular mapbox-gl interaction

          if (!layer.layout) layer.layout = {}
          layer.layout.visibility = 'none'
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

          let offset =
            layer.layout['text-size'].base / 2 + layer.paint['text-halo-width']

          if (
            markerOptions.shape === 'MAP_PIN' ||
            markerOptions.shape === 'SQUARE_PIN'
          ) {
            layer.paint['text-translate'][1] = offset
          } else {
            offset = offset + markerOptions.height / 2
          }
        } else {
          // disable all other layers
          if (!layer.layout) layer.layout = {}
          layer.layout.visibility = 'none'
        }
      }
      const layer_id = metadata['maphubs:layer_id']
      const shortid = metadata['maphubs:globalid']
        ? metadata['maphubs:globalid']
        : layer_id

      let offset = [0, 0]

      if (
        markerOptions.shape === 'MAP_PIN' ||
        markerOptions.shape === 'SQUARE_PIN'
      ) {
        offset = [0, -(markerOptions.height / 2)]
      }

      if (!existingMarkerLayer) {
        const newLayer = {
          id: 'omh-markers-' + shortid,
          type: 'symbol',
          metadata: {
            'maphubs:interactive': true
          },
          source: pointLayer.source,
          'source-layer': pointLayer['source-layer'],
          filter: pointLayer.filter,
          layout: {
            'icon-image': imageName,
            'icon-size': 0.5,
            'icon-allow-overlap': true,
            'icon-offset': offset
          }
        }
        const newLayers = [newLayer, ...style.layers]
        style.layers = newLayers
      }
    }

    return style
  },

  disableMarkers(style: mapboxgl.Style): mapboxgl.Style {
    if (
      style.layers &&
      Array.isArray(style.layers) &&
      style.layers.length > 0
    ) {
      // treat style as immutable and return a copy
      style = JSON.parse(JSON.stringify(style))
      for (const layer of style.layers) {
        if (layer.id.startsWith('omh-markers-')) {
          if (!layer.layout) layer.layout = {}
          layer.layout.visibility = 'none'
        } else if (layer.id.startsWith('omh-data-point')) {
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

          if (!layer.layout) layer.layout = {}
          layer.layout.visibility = 'visible'
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
      }
    }

    return style
  }
}
