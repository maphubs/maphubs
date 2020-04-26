
var KEY = process.env.TILEHOSTING_MAPS_API_KEY

var roadsUpdate = (style, styleLayer, classes) => {
  style.layers.forEach((layer) => {
    layer['source-layer'] = 'transportation'
  })
  style.layers = [style.layers[0]]
  styleLayer.filter = [
    'all',
    [
      '==',
      '$type',
      'LineString'
    ],
    [
      'in',
      'class'
    ]
  ]
  classes.forEach((filterClass) => {
    styleLayer.filter[2].push(filterClass)
  })

  return styleLayer
}

exports.up = (knex) => {
  return knex('omh.layers')
    .select('layer_id', 'name', 'style')
    .where({owned_by_group_id: 'OpenStreetMap'})
    .then(layers => {
      if (layers && Array.isArray(layers)) {
        var updateCommands = []
        layers.forEach(layer => {
          const style = layer.style
          const name = layer.name

          if (style && style.layers && style.sources.osm) {
            style.layers.forEach(styleLayer => {
              style.sources.osm.tiles = [`https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf.pict?key=${KEY}`]
              if (layer.layer_id === 1) { // buildings
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'building'
                })
                style.layers = [style.layers[0]]
              } else if (layer.layer_id === 2) { // park
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['==', 'subclass', 'park']
              } else if (layer.layer_id === 3) { // forest / wood
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['==', 'class', 'wood']
              } else if (layer.layer_id === 4) { // meadows
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['==', 'subclass', 'meadow']
              } else if (layer.layer_id === 5) { // grass
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['==', 'class', 'grass']
              } else if (layer.layer_id === 6) { // wetland
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['==', 'class', 'wetland']
              } else if (layer.layer_id === 7) { // protected area
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'park'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['in', '$type', 'Polygon']
              } else if (layer.layer_id === 9) { // national park
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'park'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'national_park']]
              } else if (layer.layer_id === 9) { // nature reserve
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'park'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'nature_reserve']]
              } else if (layer.layer_id === 10) { // industrial
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'industrial']]
              } else if (layer.layer_id === 10) { // industrial
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'industrial']]
              } else if (layer.layer_id === 11) { // commercial
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'commercial']]
              } else if (layer.layer_id === 12) { // retail
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'retail']]
              } else if (layer.layer_id === 13) { // residential
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'residential']]
              } else if (layer.layer_id === 14) { // farms
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'farmland']]
              } else if (layer.layer_id === 15) { // sports /pitch
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['in', 'class', 'pitch', 'stadium']]
              } else if (layer.layer_id === 16) { // mining
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                  layer.visibility = 'none' // Disable this for now, not available in data
                })
                style.layers = [style.layers[0]]
              } else if (layer.layer_id === 17) { // hospital
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'hospital']]
              } else if (layer.layer_id === 18) { // school
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['in', 'class', 'school', 'kindergarten']]
              } else if (layer.layer_id === 19) { // parking
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                  layer.visibility = 'none' // Disable this for now, not available in data
                })
                style.layers = [style.layers[0]]
              } else if (layer.layer_id === 20) { // military
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'military']]
              } else if (layer.layer_id === 21) { // power substation
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                  layer.visibility = 'none' // Disable this for now, not available in data
                })
                style.layers = [style.layers[0]]
              } else if (layer.layer_id === 22) { // university
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landuse'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['in', 'class', 'university', 'college']]
              } else if (layer.layer_id === 23) { // glaciers
                style.layers.forEach((layer) => {
                  layer['source-layer'] = 'landcover'
                })
                style.layers = [style.layers[0]]
                styleLayer.filter = ['all', ['in', '$type', 'Polygon'], ['==', 'class', 'ice']]
              } else if (layer.layer_id === 23) { // major roads
                styleLayer = roadsUpdate(style, styleLayer, ['trunk', 'motorway', 'motorway_link', 'trunk_link'])
              } else if (layer.layer_id === 25) { // primary roads
                styleLayer = roadsUpdate(style, styleLayer, ['primary', 'primary_link'])
              } else if (layer.layer_id === 26) { // secondary roads
                styleLayer = roadsUpdate(style, styleLayer, ['secondary', 'secondary_link'])
              } else if (layer.layer_id === 27) { // tertiary roads
                styleLayer = roadsUpdate(style, styleLayer, ['tertiary', 'tertiary_link'])
              } else if (layer.layer_id === 28) { // minor roads
                styleLayer = roadsUpdate(style, styleLayer, ['minor', 'unclassified', 'road'])
              } else if (layer.layer_id === 29) { // residential roads
                styleLayer = roadsUpdate(style, styleLayer, ['residential', 'living_street'])
              } else if (layer.layer_id === 30) { // tracks roads
                styleLayer = roadsUpdate(style, styleLayer, ['track'])
              } else if (layer.layer_id === 31) { // paths roads
                styleLayer = roadsUpdate(style, styleLayer, ['path', 'pedestrian', 'footpath', 'footway', 'steps', 'cycleway'])
              } else if (layer.layer_id === 32) { // service roads
                styleLayer = roadsUpdate(style, styleLayer, ['service', 'alley', 'parking_aisle', 'drive-through', 'driveway'])
              }
            })
          }
          updateCommands.push(knex('omh.layers').update({style, name, source: {en: 'OpenMapTiles/OpenStreetMap contributors'}}).where({layer_id: layer.layer_id}))
        })
        return Promise.all(updateCommands)
      } else {
        return null
      }
    })
}

exports.down = () => {
  return Promise.resolve()
}
