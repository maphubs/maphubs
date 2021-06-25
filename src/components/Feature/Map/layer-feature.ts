import type { Layer } from '../../../types/layer'

function getLayerFRActive(
  layer: Record<string, any>,
  geojson: Record<string, any>
): Layer {
  const defaultColor = 'yellow'
  const layers = [
    {
      id: 'omh-data-point-feature-geojson',
      type: 'circle',
      metadata: {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'Point'],
      paint: {
        'circle-color': defaultColor,
        'circle-opacity': 1
      }
    },
    {
      id: 'omh-data-line-feature-geojson',
      type: 'line',
      metadata: {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'LineString'],
      paint: {
        'line-color': defaultColor,
        'line-opacity': 0.5,
        'line-width': 2
      }
    },
    {
      id: 'omh-data-polygon-feature-geojson',
      type: 'fill',
      metadata: {
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'fill-color': 'white',
        'fill-opacity': 0
      }
    },
    {
      id: 'omh-data-outline-polygon-feature-geojson',
      type: 'line',
      metadata: {},
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'line-color': defaultColor,
        'line-opacity': 0.8,
        'line-width': 3
      }
    }
  ]
  const style = {
    version: 8,
    sources: {
      'omh-feature-geojson': {
        type: 'geojson',
        data: geojson
      }
    },
    layers
  }
  layer.style = style
  layer.legend_html = `
  <div class="omh-legend">
  <div class="block" style="border: 1px solid ${defaultColor};">
  </div>
  <h3>{NAME}</h3>
  </div>`
  return layer
}

function getLayer(
  layer: Record<string, any>,
  geojson: Record<string, any>
): Layer {
  // replace layer style with feature style
  const defaultColor = 'red'
  const defaultColorTransparent = 'rgba(255,0,0,0.3)'
  const layers = [
    {
      id: 'omh-data-point-feature-geojson',
      type: 'circle',
      metadata: {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'Point'],
      paint: {
        'circle-color': defaultColor,
        'circle-opacity': 1
      }
    },
    {
      id: 'omh-data-line-feature-geojson',
      type: 'line',
      metadata: {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'LineString'],
      paint: {
        'line-color': defaultColor,
        'line-opacity': 0.5,
        'line-width': 2
      }
    },
    {
      id: 'omh-data-polygon-feature-geojson',
      type: 'fill',
      metadata: {
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'fill-color': defaultColor,
        'fill-opacity': 0.3
      }
    },
    {
      id: 'omh-data-outline-polygon-feature-geojson',
      type: 'line',
      metadata: {},
      source: 'omh-feature-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'line-color': defaultColor,
        'line-opacity': 0.8,
        'line-width': 3
      }
    }
  ]
  const style = {
    version: 8,
    sources: {
      'omh-feature-geojson': {
        type: 'geojson',
        data: geojson
      }
    },
    layers
  }
  layer.style = style
  layer.settings = {
    active: true
  }
  let isPoint

  if (geojson && geojson.features) {
    const feature = geojson.features[0]

    if (
      feature.geometry.type === 'Point' ||
      feature.geometry.type === 'LineString'
    ) {
      isPoint = true
    }
  }

  if (isPoint) {
    layer.legend_html = `
    <div class="omh-legend">
    <div class="point" style="background-color: ${defaultColor};">
    </div>
    <h3>{NAME}</h3>
    </div>`
  } else {
    layer.legend_html = `
    <div class="omh-legend">
    <div class="block" style="background-color: ${defaultColorTransparent}; border: 1px solid ${defaultColor};">
    </div>
    <h3>{NAME}</h3>
    </div>`
  }

  return layer
}

export { getLayer, getLayerFRActive }