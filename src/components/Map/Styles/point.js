//@flow
module.exports = {
  getPointLayers(layer_id: number, color: string, hoverColor: string, interactive: boolean, showBehindBaseMapLabels: boolean){

    var layers = [
      {
        "id": "omh-data-point-" + layer_id,
        "type": "circle",
        "metadata":{
          "maphubs:layer_id": layer_id,
          "maphubs:interactive": interactive,
          "maphubs:showBehindBaseMapLabels": showBehindBaseMapLabels
        },
        "source": "omh-" + layer_id,
        "source-layer": '',
        "filter": ["in", "$type", "Point"],
        "paint": {
          "circle-color": color,
          "circle-opacity": 1
        }
      },
      {
        "id": "omh-hover-point-" + layer_id,
        "type": "circle",
        "metadata":{
          "maphubs:layer_id": layer_id
        },
        "source": "omh-" + layer_id,
        "source-layer": '',
        "filter": ["==", "mhid", ""],
        "paint": {
          "circle-radius": 15,
          "circle-color": hoverColor,
          "circle-opacity": 0.5
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