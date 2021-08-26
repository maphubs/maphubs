import type { Layer } from '../../../types/layer'

function getGLADLayer(
  gladGeoJSON: Record<string, any>,
  active: boolean
): Layer {
  const gladColor = 'red'
  const layers = [
    {
      id: 'omh-data-polygon-glad-geojson',
      type: 'fill',
      metadata: {
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'fr-glad-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'fill-color': gladColor,
        'fill-opacity': 0.2
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    },
    {
      id: 'fr-data-outline-polygon-glad-geojson',
      type: 'line',
      metadata: {},
      source: 'fr-glad-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'line-color': gladColor,
        'line-opacity': 1,
        'line-width': 1
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    }
  ]
  return {
    layer_id: 99999902,
    short_id: 'fr-glad-geojson',
    name: {
      en: 'GLAD Forest Alerts'
    },
    source: {
      en: 'GLAD/UMD'
    },
    style: {
      version: 8,
      sources: {
        'fr-glad-geojson': {
          type: 'geojson',
          data: gladGeoJSON
        }
      },
      layers,
      metadata: {
        'maphubs:active': active
      }
    },
    legend_html: `
    <div class="omh-legend">
    <div class="block" style="background-color: ${gladColor}">
    </div>
    <h3>{NAME}</h3>
    </div>`,
    is_external: true
  }
}

export default getGLADLayer
export { getGLADLayer }