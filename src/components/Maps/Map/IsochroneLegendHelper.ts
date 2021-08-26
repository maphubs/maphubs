export default {
  getLegendLayers() {
    return [
      {
        active: true,
        layer_id: '-2',
        name: 'Travel Time',
        source: '',
        description: '',
        owned_by_group_id: '',
        remote: true,
        is_external: true,
        external_layer_config: {},
        style: {
          source: {},
          layers: []
        },
        legend_html: `
        <div class="omh-legend">
<h3>Estimated Travel Time</h3>
<table style="table-layout: fixed; width: 100%;">
    <thead>
        <tr style="font-size: 8px;">
            <th style="padding: 0; text-align: center;">0-30mins</th>
            <th style="padding: 0; text-align: center;">30mins-1hr</th>
            <th style="padding: 0; text-align: center;">1-2hrs</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 0">
                <div style="height: 10px; line-height: 10px; background-color: green;"></div>                   
            </td>
            <td style="padding: 0">
                <div style="height: 10px; line-height: 10px; background-color: yellow;"></div>
            </td>           
            <td style="padding: 0">
                <div style="height: 10px; line-height: 10px; background-color: red;"></div>
            </td>
        </tr>
    </tbody>
</table>
</div>
        `
      }
    ]
  }
}