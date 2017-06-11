//@flow
module.exports = {
getLineLayers(layer_id, color, hoverColor, interactive, showBehindBaseMapLabels){
    var layers = [
      {
        "id": "omh-data-line-" + layer_id,
        "type": "line",
        "metadata":{
          "maphubs:layer_id": layer_id,
          "maphubs:interactive": interactive,
          "maphubs:showBehindBaseMapLabels": showBehindBaseMapLabels
        },
        "source": "omh-" + layer_id,
        "filter": ["in", "$type", "LineString"],
        "paint": {
          "line-color": color,
          "line-opacity": 0.5,
          "line-width": 2
        }
      },
      {
        "id": "omh-hover-line-" + layer_id,
        "type": "line",
        "metadata":{
          "maphubs:layer_id": layer_id
        },
        "source": "omh-" + layer_id,
        "filter": ["==", "mhid", ""],
        "paint": {
          "line-color": hoverColor,
          "line-opacity": 0.3,
          "line-width": 1
        },
        "paint.selected": {
          "line-color": hoverColor,
          "line-opacity": 0.3,
          "line-width": 1
        }
      }
    ];

    if(layer_id !== 'geojson'){
      layers.forEach((layer) => {
        layer["source-layer"] = "data";
      });
    }
    return layers;
  },
};