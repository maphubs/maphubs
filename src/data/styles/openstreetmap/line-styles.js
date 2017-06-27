module.exports = {

  getLegend: function(data_type, name, color) {
        var html = '';
   if(data_type  === 'line'){
          html = `<div class="omh-legend">
  <div class="block double-stroke" style="height:  4px; background-color: ` + color + `">
  </div>
  <h3>` + name + `</h3>
  </div>`;

}else {
         html = `<div class="omh-legend">
   <div class="block double-stroke" style="background-color: ` + color + `">
   </div>
   <h3>` + name + `</h3>
   </div>
  `;
       }
        return html;
},

  getStyle: function(tag, name, color, layer, filterTag, filterValues, width){

    return {
        "version": 8,
        "name": name + " - OpenStreetMap",
        "data_type": "line",
        "sources": {
          "osm": {
              "type": "vector",
              "tiles": ["https://vector.mapzen.com/osm/all/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo"]
          }
        },
        "layers": [
          {
            "id": "osm-"+ tag + "-line",
            "type": "line",
            "interactive": true,
            "source": "osm",
            "source-layer": layer,
            "filter": [ "all",
              ["in", filterTag].concat(filterValues)
            ],
            "paint": {
              "line-color": color,
              "line-opacity": 0.5,
              "line-width": width
            }
          },
          {
          "id": "osm-" + tag + "-hover-line",
          "type": "line",
          "interactive": false,
          "source": "osm",
          "source-layer": layer,
          "filter": [ "all",
            ["in", filterTag].concat(filterValues),
            ["==", "id", ""]
          ],
          "paint": {
            "line-color": "yellow",
            "line-opacity": 0.3,
            "line-width": 1
          }
        }
        ]
    };

  }
};
