import _bbox from '@turf/bbox'
import { FeatureCollection } from 'geojson'
import MapStyles from '../Styles'
export default {
  initGeoJSON(data: FeatureCollection): void {
    const { map } = this
    if (map) {
      if (
        data &&
        data.features &&
        Array.isArray(data.features) &&
        data.features.length > 0
      ) {
        map.addSource('omh-geojson', {
          type: 'geojson',
          data
        })
        const glStyle = MapStyles.style.defaultStyle(
          'geojson',
          'geojson',
          undefined,
          undefined
        )
        // glStyle.sources["omh-geojson"] = {"type": "geojson", data};
        glStyle.layers.map((layer) => {
          map.addLayer(layer)
        })
        const interactiveLayers = this.getInteractiveLayers(glStyle)
        this.setState({
          interactiveLayers
        })
        this.zoomToData(data)
      } else {
        // empty data
        this.debugLog('Empty/Missing GeoJSON Data')
      }
    } else {
      this.debugLog('Map not initialized')
    }
  },

  /**
   * Called when clearing search
   */
  resetGeoJSON(): void {
    const geoJSONData = this.map.getSource('omh-geojson')
    geoJSONData.setData({
      type: 'FeatureCollection',
      features: []
    })
    this.map.flyTo({
      center: [0, 0],
      zoom: 0
    })
  },

  zoomToData(data: FeatureCollection): void {
    const bbox =
      data.bbox && Array.isArray(data.bbox) && data.bbox.length > 0
        ? (data.bbox as Array<number>)
        : _bbox(data)

    if (bbox) {
      let s = bbox[0]
      if (s < -175) s = -175
      let w = bbox[1]
      if (w < -85) w = -85
      let n = bbox[2]
      if (n > 175) n = 175
      let e = bbox[3]
      if (e > 85) e = 85
      const bounds = [
        [s, w],
        [n, e]
      ]
      this.map.fitBounds(bounds, {
        padding: 25,
        curve: 3,
        speed: 0.6,
        maxZoom: 12
      })
    }
  }
}
