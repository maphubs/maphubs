// @flow
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('mapboxGLHelperMixin')

/**
 * Helper functions for interfacing with MapboxGL
 */
export default {

  getBounds () {
    if (this.map) {
      return this.map.getBounds().toArray()
    }
  },

  getPosition () {
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

  updatePosition () {
    debug.log('(' + this.state.id + ') ' + 'UPDATE POSITION')
    const map = this.map
    map.setView(this.state.map.position.center, this.state.map.position.zoom, {animate: false})
  },

  flyTo (center: any, zoom: number) {
    this.map.flyTo({center, zoom})
  },

  getBoundsObject (bbox: Array<number>) {
    return [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
  },

  fitBounds (bbox: Array<number>, maxZoom: number, padding: number = 0, animate: boolean = true) {
    const bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
    this.map.fitBounds(bounds, {padding, curve: 1, speed: 0.6, maxZoom, animate})
  },

  changeLocale (locale: string, map: any) {
    if (!locale || !map) {
      debug.log('missing required args')
    }

    debug.log(`(${this.state.id}) changing map language to: ${locale}`)
    try {
      const name = `{name:${locale}}`
      if (this.state.baseMap === 'streets') {
        map.setLayoutProperty('continent', 'text-field', name)
        map.setLayoutProperty('state', 'text-field', name)
        map.setLayoutProperty('country_1', 'text-field', name)
        map.setLayoutProperty('country_2', 'text-field', name)
        map.setLayoutProperty('country_3', 'text-field', name)
        map.setLayoutProperty('country_other', 'text-field', name)
        map.setLayoutProperty('place_other', 'text-field', name)
        map.setLayoutProperty('place_city', 'text-field', name)
        map.setLayoutProperty('place_town', 'text-field', name)
        map.setLayoutProperty('place_village', 'text-field', name)
        map.setLayoutProperty('water_name_line', 'text-field', name)
        map.setLayoutProperty('water_name_point', 'text-field', name)
        map.setLayoutProperty('airport-label-major', 'text-field', name)
        map.setLayoutProperty('road_label', 'text-field', name)
      } else if (this.state.baseMap === 'default' || this.state.baseMap === 'dark') {
        map.setLayoutProperty('place_country_major', 'text-field', name)
        map.setLayoutProperty('place_country_other', 'text-field', name)
        map.setLayoutProperty('place_state', 'text-field', name)
        map.setLayoutProperty('place_city_large', 'text-field', name)
        map.setLayoutProperty('place_capital', 'text-field', name)
        map.setLayoutProperty('place_city', 'text-field', name)
        map.setLayoutProperty('place_town', 'text-field', name)
        map.setLayoutProperty('place_village', 'text-field', name)
        map.setLayoutProperty('place_suburb', 'text-field', name)
        map.setLayoutProperty('place_other', 'text-field', name)
        map.setLayoutProperty('water_name', 'text-field', name)
      } else if (this.state.baseMap === 'topo') {
        map.setLayoutProperty('continent', 'text-field', name)
        map.setLayoutProperty('state', 'text-field', name)
        map.setLayoutProperty('country_1', 'text-field', name)
        map.setLayoutProperty('country_2', 'text-field', name)
        map.setLayoutProperty('country_3', 'text-field', name)
        map.setLayoutProperty('country_other', 'text-field', name)
        map.setLayoutProperty('place_city_capital', 'text-field', name)
        map.setLayoutProperty('place_city', 'text-field', name)
        map.setLayoutProperty('place_town', 'text-field', name)
        map.setLayoutProperty('place_village', 'text-field', name)
        map.setLayoutProperty('place_other', 'text-field', name)
        map.setLayoutProperty('mountain_peak', 'text-field', name)
        map.setLayoutProperty('waterway-name', 'text-field', name)
        map.setLayoutProperty('water_name_point', 'text-field', name)
        map.setLayoutProperty('road_label', 'text-field', name)
        map.setLayoutProperty('road_label_track', 'text-field', name)
      } else if (this.state.baseMap === 'satellite') {
        map.setLayoutProperty('country_label', 'text-field', name)
        map.setLayoutProperty('country_other_label', 'text-field', name)
        map.setLayoutProperty('place_label_city', 'text-field', name)
        map.setLayoutProperty('place_label_other', 'text-field', name)
        map.setLayoutProperty('road_major_label', 'text-field', name)
        map.setLayoutProperty('airport-label', 'text-field', name)
        map.setLayoutProperty('poi_label', 'text-field', name)
      }
    } catch (err) {
      debug.error(err)
    }
  }
}
