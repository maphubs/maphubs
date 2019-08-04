module.exports = {

  getLegend: function (data_type, name, color) {
    var html = ''
    if (data_type === 'point') {
      html = `<div class="omh-legend">
   <div class="point double-stroke" style="background-color: ` + color + `">
   </div>
   <h3>` + name + `</h3>
   </div>
  `
    } else if (data_type === 'line') {
      html = `<div class="omh-legend">
  <div class="block double-stroke" style="height:  4px; background-color: ` + color + `">
  </div>
  <h3>` + name + `</h3>
  </div>`
    } else if (data_type === 'polygon') {
      html = `<div class="omh-legend">
   <div class="block double-stroke" style="background-color: ` + color + `">
   </div>
   <h3>` + name + `</h3>
   </div>
  `
    } else {
      html = `<div class="omh-legend">
   <div class="block double-stroke" style="background-color: ` + color + `">
   </div>
   <h3>` + name + `</h3>
   </div>
  `
    }
    return html
  },

  getStyle: function (tag, name, color, outlineColor, layer, kinds) {
    return {
      version: 8,
      name: name + ' - OpenStreetMap',
      data_type: 'polygon',
      sources: {
        osm: {
          type: 'vector',
          tiles: ['https://vector.mapzen.com/osm/all/{z}/{x}/{y}.mvt?api_key=vector-tiles-ltPfkfo']
        }
      },
      layers: [
        {
          id: 'osm-' + tag + '-polygon',
          type: 'fill',
          interactive: true,
          source: 'osm',
          'source-layer': layer,
          filter: ['all',
            ['in', 'kind'].concat(kinds),
            ['in', '$type', 'Polygon']
          ],
          paint: {
            'fill-color': color,
            'fill-outline-color': '#222222',
            'fill-opacity': 0.5
          }
        },
        {
          id: 'osm-' + tag + '-hover-polygon',
          type: 'fill',
          interactive: false,
          source: 'osm',
          'source-layer': layer,
          filter: ['all',
            ['in', 'kind'].concat(kinds),
            ['in', '$type', 'Polygon'],
            ['==', 'id', '']
          ],
          paint: {
            'fill-color': 'yellow',
            'fill-outline-color': 'black',
            'fill-opacity': 0.7
          }
        }
      ]
    }
  }
}
