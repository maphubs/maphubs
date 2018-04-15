// @flow
import request from 'superagent'
import type {GLLayer, GLSource} from '../../../types/mapbox-gl-style'

const MapboxSource = {
  load (key: string, source: GLSource, mapComponent: any) {
    const mapboxid = source.mapboxid || ''
    const url = `https://api.mapbox.com/styles/v1/${mapboxid}?access_token=${MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}`
    return request.get(url)
      .then((res) => {
        const mbstyle = res.body
        mapComponent.mbstyle = mbstyle

        // TODO: not sure if it is possible to combine sprites/glyphs sources yet, so this doesn't work with all mapbox styles

        // add sources
        return Object.keys(mbstyle.sources).forEach((key) => {
          const source = mbstyle.sources[key]
          mapComponent.addSource(key, source)
        })
      })
  },
  addLayer (layer: GLLayer, source: GLSource, position: number, mapComponent: any) {
    this.mbstyle.layers.forEach((mbStyleLayer: GLLayer) => {
      if (mbStyleLayer.type !== 'background') { // ignore the Mapbox Studio background layer
        if (mapComponent.state.editing) {
          mapComponent.addLayerBefore(mbStyleLayer, mapComponent.getFirstDrawLayerID())
        } else {
          mapComponent.addLayer(mbStyleLayer, position)
        }
      }
    })
  },
  removeLayer (layer: GLLayer, mapComponent: any) {
    this.mbstyle.layers.forEach((mbStyleLayer: GLLayer) => {
      mapComponent.removeLayer(mbStyleLayer.id)
    })
  },
  remove (key: string, mapComponent: any) {
    Object.keys(this.mbstyle.sources).forEach((mbstyleKey: string) => {
      mapComponent.removeSource(mbstyleKey)
    })
  }
}

export default MapboxSource
