import Settings from './settings'
import Line from './line'
import Point from './point'
import Polygon from './polygon'
import type { Layer } from '../../../../types/layer'
import _forEachRight from 'lodash.foreachright'
import DebugService from '../../lib/debug'
import mapboxgl from 'mapbox-gl'
const debug = DebugService('MapStyles/style')

type MapHubsSource = {
  data?: mapboxgl.GeoJSONSourceOptions['data']
  type?:
    | mapboxgl.Source['type']
    | 'ags-mapserver-query'
    | 'ags-mapserver-tiles'
    | 'ags-featureserver-query'
    | 'earthengine'
    | 'mapbox-style'
    | 'multiraster'
  url?: string
  tiles?: string[]
}
export default {
  defaultStyle(
    layer_id: number,
    shortid: string,
    source: MapHubsSource,
    dataType: string
  ): mapboxgl.Style {
    const settings = Settings.defaultLayerSettings()
    return this.styleWithColor(
      layer_id,
      shortid,
      source,
      'rgba(255,0,0,0.5)',
      dataType,
      settings.interactive,
      settings.showBehindBaseMapLabels
    )
  },

  styleWithColor(
    layer_id: number,
    shortid: string,
    source: MapHubsSource,
    color: string,
    dataType: string,
    interactive: boolean,
    showBehindBaseMapLabels: boolean
  ): mapboxgl.Style {
    // TODO: make default selected colors better match user color
    const hoverColor = 'yellow'
    const hoverOutlineColor = 'black'
    let layers = []

    switch (dataType) {
      case 'point': {
        layers = Point.getPointLayers(
          layer_id,
          shortid,
          color,
          hoverColor,
          interactive,
          showBehindBaseMapLabels
        )

        break
      }
      case 'line': {
        layers = Line.getLineLayers(
          layer_id,
          shortid,
          color,
          hoverColor,
          interactive,
          showBehindBaseMapLabels
        )

        break
      }
      case 'polygon': {
        layers = Polygon.getPolygonLayers(
          layer_id,
          shortid,
          color,
          hoverColor,
          hoverOutlineColor,
          interactive,
          showBehindBaseMapLabels
        )

        break
      }
      default: {
        layers = [
          ...Point.getPointLayers(
            layer_id,
            shortid,
            color,
            hoverColor,
            interactive,
            showBehindBaseMapLabels
          ),
          ...Line.getLineLayers(
            layer_id,
            shortid,
            color,
            hoverColor,
            interactive,
            showBehindBaseMapLabels
          ),
          ...Polygon.getPolygonLayers(
            layer_id,
            shortid,
            color,
            hoverColor,
            hoverOutlineColor,
            interactive,
            showBehindBaseMapLabels
          )
        ]
      }
    }

    const styles = {
      version: 8,
      sources: {},
      layers
    }

    if (source) {
      switch (source.type) {
        case 'vector': {
          const url = '{MAPHUBS_DOMAIN}/api/lyr/' + shortid + '/tile.json'
          styles.sources['omh-' + shortid] = {
            type: 'vector',
            url
          }

          break
        }
        case 'ags-mapserver-query':
        case 'ags-featureserver-query': {
          styles.sources['omh-' + shortid] = {
            type: source.type,
            url: source.url
          }

          break
        }
        case 'ags-mapserver-tiles': {
          // support existing deprecated raster tiles, new layers will use plain raster
          styles.sources[`omh-${shortid}`] = {
            type: 'raster',
            url: `${source.url}/tile/{z}/{y}/{x}`
          }

          break
        }
        case 'geojson': {
          styles.sources['omh-' + shortid] = {
            type: 'geojson',
            data: source.data
          }
          styles.layers.map((layer) => {
            delete layer['source-layer']
          })

          break
        }
        // No default
      }
    }

    return styles
  },

  getMapboxStyle(mapboxid: string): mapboxgl.Style {
    // Note: we are treating a mapbox style as a special type of "source"
    // it will be converted to sources and layers when the map loads by downloading the style json from the Mapbox API
    const style = {
      version: 8,
      sources: {},
      layers: [
        {
          id: 'mapbox-style-placeholder',
          type: 'mapbox-style-placeholder'
        }
      ]
    }
    style.sources[mapboxid] = {
      type: 'mapbox-style',
      mapboxid
    }
    return style as mapboxgl.Style
  },

  buildMapStyle(layers: Array<Layer>): mapboxgl.Style {
    const mapStyle: mapboxgl.Style = {
      version: 8,
      sources: {},
      layers: []
    }

    // reverse the order for the styles, since the map draws them in the order recieved
    _forEachRight(layers, (layer: Layer) => {
      const style = layer.style

      if (style && style.sources && style.layers) {
        // add source
        mapStyle.sources = Object.assign(mapStyle.sources, style.sources)
        // add layers
        mapStyle.layers = [...mapStyle.layers, ...style.layers]
      } else {
        if (layer.layer_id) {
          debug.log(
            `Not added to map, incomplete style for layer: ${layer.layer_id}`
          )
        }
      }
    })

    return mapStyle
  }
}
