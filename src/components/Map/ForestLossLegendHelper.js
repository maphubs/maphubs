

module.exports = {
  getLegendLayers(){
    return [   
      {
        active: true,
        layer_id: '-2',
        name: 'Tree Cover 2000',
        source: '',
        description: '',
        owned_by_group_id: 'GLAD',
        remote: true,
        is_external: true,
        external_layer_config: {},
        style: {
          source: {}, layers:[]
        },
        legend_html: `
        <div class="omh-legend">
<h3>Tree Cover 2000</h3>
<table style="table-layout: fixed; width: 100%;">
    <thead>
        <tr style="font-size: 8px;">
            <th style="padding: 0; text-align: center;">1%-33%</th>
            <th style="padding: 0; text-align: center;">34%-66%</th>
            <th style="padding: 0; text-align: center;">67%-100%</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 0">
                <div style="height: 10px; line-height: 10px; background-color: #FDFFD1;"></div>                   
            </td>
            <td style="padding: 0">
                <div style="height: 10px; line-height: 10px; background-color: #AAFF78;"></div>
            </td>           
            <td style="padding: 0">
                <div style="height: 10px; line-height: 10px; background-color: #267300;"></div>
            </td>
        </tr>
    </tbody>
</table>
</div>
        `
      },
       {
        active: true,
        layer_id: '-1',
        name: 'Tree Cover Loss 2001-2014',
        source: 'Hansen/UMD/Google/USGS/NASA',
        description: '',
        owned_by_group_id: 'GLAD',
        remote: true,
        is_external: true,
        external_layer_config: {},
        style: {
          source: {}, layers:[]
        },
        legend_html: `
          <div class="omh-legend">
 <div style="background-color: #FF0000; width: 10px; height: 10px; float: left; margin-right: 5px;">
 </div>
 <h3>Tree Cover Loss 2001-2014</h3>
 </div>
        `
      }
    ];
  }
};