//@flow
import type {Layer} from '../../../stores/layer-store';
module.exports = {
  defaultLegend(layer: Layer) {
    return this.legendWithColor(layer, "red");
  },

  rasterLegend(){
    //var name = this.htmlEncode(layer.name);
    var html = `<div class="omh-legend">\n<h3>{NAME}</h3>\n</div>`;
    return html;
  },

  legendWithColor(layer: Layer, color: string) {
      var html = '';
      //var name = this.htmlEncode(layer.name);
      if(layer.data_type === 'point'){
        html = `<div class="omh-legend">
 <div class="point" style="background-color: ` + color + `">
 </div>
 <h3>{NAME}</h3>
 </div>
`;

      }else if(layer.data_type  === 'line'){
        html = `<div class="omh-legend">
<div class="block" style="height:  4px; background-color: ` + color + `">
</div>
<h3>{NAME}</h3>
</div>`;

      }else if(layer.data_type  === 'polygon'){
        html = `<div class="omh-legend">
 <div class="block double-stroke" style="background-color: ` + color + `">
 </div>
 <h3>{NAME}</h3>
 </div>
`;
     }else {
       html = `<div class="omh-legend">
 <div class="block double-stroke" style="background-color: ` + color + `">
 </div>
 <h3>{NAME}</h3>
 </div>
`;
     }
      return html;
    },

    outlineLegendWithColor(layer: Layer, color: string) {

      return `<div class="omh-legend">
 <div class="block" style="border: ${color} solid 3px;">
 </div>
 <h3>{NAME}</h3>
 </div>
`;

    }

};