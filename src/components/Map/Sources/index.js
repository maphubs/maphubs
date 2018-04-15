// @flow
import AGSRaster from './AGSRaster'
import AGSMapServerQuery from './AGSMapServerQuery'
import AGSFeatureServerQuery from './AGSFeatureServerQuery'
import MapboxSource from './MapboxSource'
import MapHubsSource from './MapHubsSource'
import RasterSource from './RasterSource'
import GenericSource from './GenericSource'

export default {
  getSource (key, source) {
    const response = function (driver: Function, custom: boolean = false) {
      return {
        key,
        source,
        custom,
        driver
      }
    }
    if (
      !key.startsWith('osm') &&
      source.type === 'vector' &&
      (!source.url || !source.url.startsWith('mapbox://'))
    ) {
      return response(this['maphubs-vector'])
    } else if (
      source.type === 'geojson' &&
      source.data
    ) {
      return response(this['maphubs-vector'])
    } else if (
      source.type === 'arcgisraster'
    ) {
      return response(this['arcgisraster'], true)
    } else if (
      this[source.type] &&
      this[source.type].addLayer
    ) {
      // use custom driver for this source type
      return response(this[source.type])
    } else {
      return response(this['generic'])
    }
  },
  'arcgisraster': AGSRaster,
  'ags-mapserver-query': AGSMapServerQuery,
  'ags-featureserver-query': AGSFeatureServerQuery,
  'mapbox-style': MapboxSource,
  'maphubs-vector': MapHubsSource,
  'raster': RasterSource,
  'generic': GenericSource
}
