import type { Layer } from '../../../types/layer'

function getIFLLayer(geoJSON: Record<string, any>, active: boolean): Layer {
  const iflColor = 'rgba(104,159,56,0.65)'
  const layers = [
    {
      id: 'omh-data-polygon-ifl2016-geojson',
      type: 'fill',
      metadata: {
        'maphubs:interactive': false,
        'maphubs:showBehindBaseMapLabels': false
      },
      source: 'fr-ifl2016-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'fill-color': iflColor,
        'fill-opacity': 1
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    },
    {
      id: 'fr-data-outline-polygon-ifl2016-geojson',
      type: 'line',
      metadata: {},
      source: 'fr-ifl2016-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'line-color': iflColor,
        'line-opacity': 1,
        'line-width': 1
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    }
  ]
  return {
    layer_id: 99999903,
    short_id: 'fr-ifl2016-geojson',
    name: {
      en: 'Intact Forest Landscape 2016'
    },
    source: {
      en: 'Greenpeace;UMD;TransparentWorld;WRI;WWF-Russia'
    },
    style: {
      version: 8,
      sources: {
        'fr-ifl2016-geojson': {
          type: 'geojson',
          data: geoJSON
        }
      },
      layers,
      metadata: {
        'maphubs:active': active
      }
    },
    legend_html: `
    <div class="omh-legend">
    <div class="block" style="background-color: ${iflColor}">
    </div>
    <h3>{NAME}</h3>
    </div>`,
    is_external: true
  }
}

export default getIFLLayer
export { getIFLLayer }