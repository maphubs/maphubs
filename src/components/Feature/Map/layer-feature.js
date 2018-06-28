// @flow

import type {Layer} from '../../../stores/layer-store'

function getLayerFRActive (layer: Object, geojson: Object): Layer {
  const defaultColor = 'yellow'
  const layers = [
    {
      'id': `omh-data-point-feature-geojson`,
      'type': 'circle',
      'metadata': {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'Point'],
      'paint': {
        'circle-color': defaultColor,
        'circle-opacity': 1
      }
    }, {
      'id': `omh-data-line-feature-geojson`,
      'type': 'line',
      'metadata': {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'LineString'],
      'paint': {
        'line-color': defaultColor,
        'line-opacity': 0.5,
        'line-width': 2
      }
    },
    {
      'id': `omh-data-polygon-feature-geojson`,
      'type': 'fill',
      'metadata': {
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'Polygon'],
      'paint': {
        'fill-color': 'white',
        'fill-opacity': 0
      }
    }, {
      'id': `omh-data-outline-polygon-feature-geojson`,
      'type': 'line',
      'metadata': {
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'Polygon'],
      'paint': {
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

function getLayer (layer: Object, geojson: Object): Layer {
  // replace layer style with feature style
  const defaultColor = 'red'
  const layers = [
    {
      'id': `omh-data-point-feature-geojson`,
      'type': 'circle',
      'metadata': {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'Point'],
      'paint': {
        'circle-color': defaultColor,
        'circle-opacity': 1
      }
    }, {
      'id': `omh-data-line-feature-geojson`,
      'type': 'line',
      'metadata': {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'LineString'],
      'paint': {
        'line-color': defaultColor,
        'line-opacity': 0.5,
        'line-width': 2
      }
    },
    {
      'id': `omh-data-polygon-feature-geojson`,
      'type': 'fill',
      'metadata': {
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'Polygon'],
      'paint': {
        'fill-color': defaultColor,
        'fill-opacity': 0.3
      }
    }, {
      'id': `omh-data-outline-polygon-feature-geojson`,
      'type': 'line',
      'metadata': {
      },
      'source': 'omh-feature-geojson',
      'filter': ['in', '$type', 'Polygon'],
      'paint': {
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

  layer.legend_html = `
  <div class="omh-legend">
  <div class="block" style="background-color: ${defaultColor}; border: 1px solid ${defaultColor};">
  </div>
  <h3>{NAME}</h3>
  </div>`

  return layer
}

export {
  getLayer,
  getLayerFRActive
}