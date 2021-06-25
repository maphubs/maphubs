import type { Layer } from '../../../types/layer'

function getIFLLossLayer(
  loss0013: Record<string, any>,
  loss1316: Record<string, any>,
  active: boolean
): Layer {
  const loss0013Color = 'rgba(255,102,0,0.9)'
  const loss1316Color = 'rgba(223,82,134,0.93)'
  const layers = [
    {
      id: 'fr-data-polygon-iflloss0013-geojson',
      type: 'fill',
      metadata: {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false,
        'maphubs:outline-only': true
      },
      source: 'fr-iflloss0013-geojson',
      paint: {
        'fill-color': `${loss0013Color}`,
        'fill-opacity': 0
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    },
    {
      id: 'fr-data-outline-polygon-iflloss0013-geojson',
      type: 'line',
      source: 'fr-iflloss0013-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'line-color': `${loss0013Color}`,
        'line-opacity': 0.8,
        'line-width': 3
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    },
    {
      id: 'fr-data-polygon-iflloss1316-geojson',
      type: 'fill',
      metadata: {
        'maphubs:interactive': true,
        'maphubs:showBehindBaseMapLabels': false,
        'maphubs:outline-only': true
      },
      source: 'fr-iflloss1316-geojson',
      paint: {
        'fill-color': `${loss1316Color}`,
        'fill-opacity': 0
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    },
    {
      id: 'fr-data-outline-polygon-iflloss1316-geojson',
      type: 'line',
      source: 'fr-iflloss1316-geojson',
      filter: ['in', '$type', 'Polygon'],
      paint: {
        'line-color': `${loss1316Color}`,
        'line-opacity': 0.8,
        'line-width': 3
      },
      layout: {
        visibility: active ? 'visible' : 'none'
      }
    }
  ]
  return {
    layer_id: 99999904,
    short_id: 'fr-iflloss-geojson',
    name: {
      en: 'Intact Forest Landscape Loss'
    },
    source: {
      en: 'Greenpeace;UMD;TransparentWorld;WRI;WWF-Russia'
    },
    style: {
      version: 8,
      sources: {
        'fr-iflloss0013-geojson': {
          type: 'geojson',
          data: loss0013
        },
        'fr-iflloss1316-geojson': {
          type: 'geojson',
          data: loss1316
        }
      },
      layers,
      metadata: {
        'maphubs:active': active
      }
    },
    legend_html: `
    <div class="omh-legend">
    <h3>{NAME}</h3>
    <table style="max-width: 100px; margin-bottom: 10px;">
    <thead>
      <tr>
        <th class="center no-padding" style="font-size: 7px;">2000-2013</th>
        <th class="center no-padding" style="font-size: 7px;">2013-2016</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td  class="center no-padding" style="background-color: ${loss0013Color}; width: 20px; height: 10px; border-radius: 0;"></td>   
        <td  class="center no-padding" style="background-color: ${loss1316Color}; width: 20px; height: 10px; border-radius: 0;"></td>  
      </tr>
    </tbody>
  </table>
  </div>`,
    is_external: true
  }
}

export default getIFLLossLayer
export { getIFLLossLayer }