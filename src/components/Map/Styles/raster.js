// @flow
import type {GLLayer} from '../../../types/mapbox-gl-style'
export default {
  defaultRasterStyle (layer_id: number, shortid: string, elc: Object, type: string = 'raster') {
    return this.rasterStyleWithOpacity(layer_id, shortid, elc, 100, type, elc)
  },

  defaultMultiRasterStyle (layer_id: number, shortid: string, layers: Array<GLLayer>, type: string = 'raster', elc?: Object) {
    return this.multiRasterStyleWithOpacity(layer_id, shortid, layers, 100, type, elc)
  },

  rasterStyleTileJSON (layer_id: number, shortid: string, sourceUrl: string, opacity: number, type: string = 'raster') {
    opacity = opacity / 100
    const style = {
      sources: {},
      layers: [
        {
          'id': 'omh-raster-' + shortid,
          'type': 'raster',
          'metadata': {
            'maphubs:layer_id': layer_id,
            'maphubs:globalid': shortid
          },
          'source': 'omh-' + shortid,
          'minzoom': 0,
          'maxzoom': 18,
          'paint': {
            'raster-opacity': opacity
          }
        }
      ]
    }

    style.sources['omh-' + shortid] = {
      type,
      url: sourceUrl,
      'tileSize': 256
    }

    return style
  },

  rasterStyleWithOpacity (layer_id: number, shortid: string, elc: Object, opacity: number, type: string = 'raster') {
    opacity = opacity / 100
    const style = {
      sources: {},
      layers: [
        {
          'id': 'omh-raster-' + shortid,
          'type': 'raster',
          'metadata': {
            'maphubs:layer_id': layer_id,
            'maphubs:globalid': shortid
          },
          'source': 'omh-' + shortid,
          'minzoom': 0,
          'maxzoom': 18,
          'paint': {
            'raster-opacity': opacity
          }
        }
      ]
    }

    let metadata = {}

    Object.keys(elc).forEach(key => {
      metadata[`maphubs:${key}`] = elc[key]
    })

    style.sources['omh-' + shortid] = {
      type,
      'minzoom': elc.minzoom || 0,
      'maxzoom': elc.maxzoom || 22,
      tiles: elc.tiles,
      'tileSize': elc.tileSize || 256,
      'metadata': metadata
    }

    return style
  },

  multiRasterStyleWithOpacity (layer_id: number, shortid: string, layers: Array<Object>, opacity: number, type: string = 'raster') {
    opacity = opacity / 100
    const style = {
      sources: {},
      layers: []
    }

    layers.forEach((raster, i) => {
      const id = `omh-raster-${i}-${shortid}`
      style.layers.push(
        {
          id,
          'type': 'raster',
          'metadata': {
            'maphubs:layer_id': layer_id,
            'maphubs:globalid': shortid
          },
          'source': id,
          'minzoom': 0,
          'maxzoom': 18,
          'paint': {
            'raster-opacity': opacity
          }
        }
      )
      style.sources[id] = {
        type,
        tiles: raster.tiles,
        'tileSize': 256

      }
    })

    return style
  }
}
