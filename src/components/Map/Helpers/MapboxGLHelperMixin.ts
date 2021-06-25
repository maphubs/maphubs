import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('mapboxGLHelperMixin')
/**
 * Helper functions for interfacing with MapboxGL
 */

export default {
  getBounds(): void {
    if (this.map) {
      return this.map.getBounds().toArray()
    }
  },

  getPosition(): void | {
    lat: any
    lng: any
    zoom: any
  } {
    if (this.map) {
      const center = this.map.getCenter()
      const zoom = this.map.getZoom()
      return {
        zoom,
        lng: center.lng,
        lat: center.lat
      }
    }
  },

  updatePosition() {
    debug.log('(' + this.state.id + ') ' + 'UPDATE POSITION')
    const map = this.map
    map.setView(this.state.map.position.center, this.state.map.position.zoom, {
      animate: false
    })
  },

  flyTo(center: any, zoom: number) {
    this.map.flyTo({
      center,
      zoom
    })
  },

  getBoundsObject(bbox: Array<number>): Array<Array<number>> {
    return [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]]
    ]
  },

  fitBounds(
    bbox: Array<number>,
    maxZoom: number,
    padding: number = 0,
    animate: boolean = true
  ) {
    const bounds = [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]]
    ]
    this.map.fitBounds(bounds, {
      padding,
      curve: 1,
      speed: 0.6,
      maxZoom,
      animate
    })
  },

  changeLocale(language: string, map: any) {
    if (!language || !map) {
      debug.log('missing required args')
    }

    const { baseMapState } = this.props.containers
    debug.log(`(${this.state.id}) changing map language to: ${language}`)

    try {
      if (
        baseMapState.state.baseMap === 'default' ||
        baseMapState.state.baseMap === 'dark' ||
        baseMapState.state.baseMap === 'streets' ||
        baseMapState.state.baseMap === 'satellite-streets' ||
        baseMapState.state.baseMap === 'topo'
      ) {
        if (this.languageControl) {
          this.glStyle = this.languageControl.setLanguage(
            this.glStyle,
            language
          )
          map.setStyle(this.glStyle)
        }
      }
    } catch (err) {
      debug.error(err)
    }
  }
}