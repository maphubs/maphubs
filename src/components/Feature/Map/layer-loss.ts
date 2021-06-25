import type { Layer } from '../../../types/layer'

function getLossLayer(active: boolean): Layer {
  return {
    layer_id: 99999905,
    short_id: 'fr-tree-cover-loss',
    name: {
      en: 'Tree Cover Loss 2000 - 2018'
    },
    source: {
      en: 'Hansen/UMD/Google/USGS/NASA'
    },
    style: {
      version: 8,
      sources: {
        'fr-tree-cover-loss': {
          type: 'raster',
          tiles: [
            'https://qzxvv33134iutzy.belugacdn.link/lossramp2018/2/{z}/{x}/{y}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'fr-tree-cover-loss',
          type: 'raster',
          source: 'fr-tree-cover-loss',
          minzoom: 0,
          maxzoom: 18,
          paint: {
            'raster-opacity': 1
          },
          layout: {
            visibility: active ? 'visible' : 'none'
          }
        }
      ],
      metadata: {
        'maphubs:active': active
      }
    },
    legend_html: `
    <div class="omh-legend">
<style scoped>
    .waterLegendGradient {
  height: 10px;
  background-image: -webkit-linear-gradient(left, #3a095e, #3c0961 11.76%, #3e0964 17.64%, #400967 23.52%, #570f6d 29.40%, #70186e 35.28%, #89226a 41.16%, #a32b62 47.04%, #bb3754 52.92%, #d14544 58.80%, #e45931 64.68%, #f2711e 70.56%, #fa8d0a 76.44%, #fcab0f 82.32%, #f9ca32 88.20%, #f3e965 94.08%, #fcffa4 100%);
  background-image: -o-linear-gradient(left, #3a095e, #3c0961 11.76%, #3e0964 17.64%, #400967 23.52%, #570f6d 29.40%, #70186e 35.28%, #89226a 41.16%, #a32b62 47.04%, #bb3754 52.92%, #d14544 58.80%, #e45931 64.68%, #f2711e 70.56%, #fa8d0a 76.44%, #fcab0f 82.32%, #f9ca32 88.20%, #f3e965 94.08%, #fcffa4 100%);
  background-image: -moz-linear-gradient(left, #3a095e, #3c0961 11.76%, #3e0964 17.64%, #400967 23.52%, #570f6d 29.40%, #70186e 35.28%, #89226a 41.16%, #a32b62 47.04%, #bb3754 52.92%, #d14544 58.80%, #e45931 64.68%, #f2711e 70.56%, #fa8d0a 76.44%, #fcab0f 82.32%, #f9ca32 88.20%, #f3e965 94.08%, #fcffa4 100%);
  background-image: -ms-linear-gradient(left, #3a095e, #3c0961 11.76%, #3e0964 17.64%, #400967 23.52%, #570f6d 29.40%, #70186e 35.28%, #89226a 41.16%, #a32b62 47.04%, #bb3754 52.92%, #d14544 58.80%, #e45931 64.68%, #f2711e 70.56%, #fa8d0a 76.44%, #fcab0f 82.32%, #f9ca32 88.20%, #f3e965 94.08%, #fcffa4 100%);
  background-image: linear-gradient(left, #3a095e, #3c0961 11.76%, #3e0964 17.64%, #400967 23.52%, #570f6d 29.40%, #70186e 35.28%, #89226a 41.16%, #a32b62 47.04%, #bb3754 52.92%, #d14544 58.80%, #e45931 64.68%, #f2711e 70.56%, #fa8d0a 76.44%, #fcab0f 82.32%, #f9ca32 88.20%, #f3e965 94.08%, #fcffa4 100%);
}
</style>
<h3>{NAME}</h3>
<table style="width: 100%; padding-bottom: 22px">
    <tbody>    
      <tr>
        <td colspan="2">
          <div class="waterLegendGradient" style="clear: both;"></div>
          <div style="color: #656565; font-size: 8px; float: left">2000</div>
          <div style="color: #656565; font-size: 8px; float: right">2018</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>`,
    is_external: true,
    external_layer_type: 'raster',
    external_layer_config: {
      type: 'raster',
      url: 'https://qzxvv33134iutzy.belugacdn.link/lossramp2018/2/{z}/{x}/{y}'
    }
  }
}

export default getLossLayer
export { getLossLayer }