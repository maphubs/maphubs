import mapboxgl from 'mapbox-gl'
import MapComponent from '../Map'

const AGSRaster = {
  async load(
    key: string,
    source: mapboxgl.Source,
    mapComponent: typeof MapComponent
  ): Promise<any> {
    // add directly to map until this is fixed https://github.com/mapbox/mapbox-gl-js/issues/3003
    return mapComponent.map.addSource(key, source)
  },

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    mapComponent: typeof MapComponent
  ): void {
    if (layer.metadata && layer.metadata['maphubs:showBehindBaseMapLabels']) {
      mapComponent.map.addLayer(layer, 'water')
    } else {
      if (mapComponent.state.editing) {
        mapComponent.map.addLayer(layer, mapComponent.getFirstDrawLayerID())
      } else {
        // get layer id at position
        if (
          mapComponent.glStyle &&
          mapComponent.glStyle.layers &&
          Array.isArray(mapComponent.glStyle.layers) &&
          mapComponent.glStyle.layers.length > position
        ) {
          const beforeLayerId = mapComponent.glStyle.layers[position].id
          mapComponent.map.addLayer(layer, beforeLayerId)
        } else {
          mapComponent.map.addLayer(layer)
        }
      }
    }
  },

  removeLayer(
    layer: mapboxgl.Layer,
    mapComponent: typeof MapComponent
  ): mapboxgl.Map {
    return mapComponent.map.removeLayer(layer.id)
  },

  remove(key: string, mapComponent: typeof MapComponent): mapboxgl.Map {
    return mapComponent.map.removeSource(key)
  }
}
export default AGSRaster
