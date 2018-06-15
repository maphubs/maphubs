// @flow

import type {Layer} from '../../../stores/layer-store'

function getRemainingLayer (active: boolean): Layer {
  return {
    layer_id: 99999901,
    short_id: 'fr-tree-cover-density',
    name: {
      en: 'Tree Cover 80% Density 2017'
    },
    source: {
      en: 'Hansen/UMD/Google/USGS/NASA'
    },
    style: {
      version: 8,
      sources: {
        'fr-tree-cover-density': {
          type: 'raster',
          tiles: [
            'https://qzxvv33134iutzy.belugacdn.link/densityatyear/17/80/{z}/{x}/{y}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          'id': 'fr-tree-cover-density',
          'type': 'raster',
          'source': 'fr-tree-cover-density',
          'minzoom': 0,
          'maxzoom': 18,
          'paint': {
            'raster-opacity': 1
          },
          'layout': {
            'visibility': active ? 'visible' : 'none'
          }
        }
      ],
      metadata: {
        'maphubs:active': active
      }
    },
    legend_html: `
    <div class="omh-legend">
    <div class="block" style="background-color: #294F2A">
    </div>
    <h3>{NAME}</h3>
    </div>`,
    is_external: true,
    external_layer_type: 'raster',
    external_layer_config: {
      type: 'raster',
      url: 'https://qzxvv33134iutzy.belugacdn.link/densityatyear/17/80/{z}/{x}/{y}'
    }
  }
}

export default getRemainingLayer
export {
  getRemainingLayer
}
