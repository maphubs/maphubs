//@flow
module.exports = {
getPolygonLayers(
  layer_id: number, 
  color: string, hoverColor: string, hoverOutlineColor: string, 
  interactive: boolean, showBehindBaseMapLabels: boolean){

    var layers = [
      {
        "id": "omh-data-polygon-" + layer_id,
        "type": "fill",
        "metadata":{
          "maphubs:layer_id": layer_id,
          "maphubs:interactive": interactive,
          "maphubs:showBehindBaseMapLabels": showBehindBaseMapLabels
        },
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "fill-color": color,
          "fill-outline-color": color,
          "fill-opacity": 0.5
        }
      }, {
        "id": "omh-data-doublestroke-polygon-" + layer_id,
        "type": "line",
        "metadata":{
          "maphubs:layer_id": layer_id
        },
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "line-color": color,
          "line-opacity": 0.3,
          "line-width": {
            "base": 0.5,
            "stops": [
              [5, 1.0],
              [6, 2.0],
              [7, 3.0],
              [8, 4.0],
              [9, 5.0],
              [10, 6.0]
            ]
          },
          "line-offset": {
            "base": 0.5,
            "stops": [
              [5, 0.5],
              [6, 1.0],
              [7, 1.5],
              [8, 2.0],
              [9, 2.5],
              [10, 3.0]
            ]
          }
        }
      }, {
        "id": "omh-data-outline-polygon-" + layer_id,
        "type": "line",
        "metadata":{
          "maphubs:layer_id": layer_id
        },
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "line-color": "#222222",
          "line-opacity": 0.8,
          "line-width": {
            "base": 0.5,
            "stops": [
              [3, 0.1],
              [4, 0.2],
              [5, 0.3],
              [6, 0.4],
              [7, 0.5],
              [8, 0.6],
              [9, 0.7],
              [10, 0.8]
            ]
          }
        }
      },
      {
      "id": "omh-hover-polygon-" + layer_id,
      "type": "fill",
      "metadata":{
          "maphubs:layer_id": layer_id
        },
      "source": "omh-" + layer_id,
      "filter": ["==", "mhid", ""],
      "paint": {
        "fill-color": hoverColor,
        "fill-outline-color": hoverOutlineColor,
        "fill-opacity": 0.7
      },
      "paint.selected": {
        "fill-color": hoverColor,
        "fill-outline-color": hoverOutlineColor,
        "fill-opacity": 0.7
      }
    }
    ];

    if(layer_id !== 'geojson'){
      layers.forEach((layer) => {
        layer["source-layer"] = "data";
      });
    }
    return layers;
  }
};