import mapboxgl from 'mapbox-gl'
import request from 'superagent'
const MapboxSource = {
  load(key: string, source: mapboxgl.Source, mapComponent: any): any {
    const mapboxid = source.mapboxid || ''
    const url = `https://api.mapbox.com/styles/v1/${mapboxid}?access_token=${mapComponent.props.mapboxAccessToken}`
    return request.get(url).then((res) => {
      const mbstyle = res.body
      mapComponent.mbstyle = mbstyle
      // TODO: not sure if it is possible to combine sprites/glyphs sources yet, so this doesn't work with all mapbox styles
      // add sources
      // eslint-disable-next-line unicorn/no-array-for-each
      return Object.keys(mbstyle.sources).forEach((key) => {
        const source = mbstyle.sources[key]
        mapComponent.addSource(key, source)
      })
    })
  },

  addLayer(
    layer: mapboxgl.Layer,
    source: mapboxgl.Source,
    position: number,
    mapComponent: any
  ): void {
    // eslint-disable-next-line unicorn/no-array-for-each
    this.mbstyle.layers.forEach((mbStyleLayer: mapboxgl.Layer) => {
      if (mbStyleLayer.type !== 'background') {
        // ignore the Mapbox Studio background layer
        if (mapComponent.state.editing) {
          mapComponent.addLayerBefore(
            mbStyleLayer,
            mapComponent.getFirstDrawLayerID()
          )
        } else {
          mapComponent.addLayer(mbStyleLayer, position)
        }
      }
    })
  },

  removeLayer(layer: mapboxgl.Layer, mapComponent: any): void {
    // eslint-disable-next-line unicorn/no-array-for-each
    this.mbstyle.layers.forEach((mbStyleLayer: mapboxgl.Layer) => {
      mapComponent.removeLayer(mbStyleLayer.id)
    })
  },

  remove(key: string, mapComponent: any): void {
    // eslint-disable-next-line unicorn/no-array-for-each
    Object.keys(this.mbstyle.sources).forEach((mbstyleKey: string) => {
      mapComponent.removeSource(mbstyleKey)
    })
  }
}
export default MapboxSource
