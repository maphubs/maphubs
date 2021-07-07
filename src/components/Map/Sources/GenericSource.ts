import mapboxgl from 'mapbox-gl'

const GenericSource = {
  load(key: string, source: mapboxgl.Source, mapComponent: any): any {
    return mapComponent.addSource(key, source)
  },

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    mapComponent: any
  ): void {
    if (mapComponent.state.editing) {
      mapComponent.addLayerBefore(layer, mapComponent.getFirstDrawLayerID())
    } else {
      mapComponent.addLayer(layer, position)
    }
  },

  removeLayer(layer: mapboxgl.Layer, mapComponent: any): void {
    mapComponent.removeLayer(layer)
  },

  remove(key: string, mapComponent: any): any {
    return mapComponent.removeSource(key)
  }
}
export default GenericSource
