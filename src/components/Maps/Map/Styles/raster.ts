import mapboxgl from 'mapbox-gl'

export default {
  defaultRasterStyle(
    layer_id: number,
    shortid: string,
    elc: Record<string, any>,
    type = 'raster'
  ): mapboxgl.Style {
    return this.rasterStyleWithOpacity(layer_id, shortid, elc, 100, type, elc)
  },

  defaultMultiRasterStyle(
    layer_id: number,
    shortid: string,
    layers: Array<mapboxgl.Layer>,
    type = 'raster',
    elc?: Record<string, any>
  ): mapboxgl.Style {
    return this.multiRasterStyleWithOpacity(
      layer_id,
      shortid,
      layers,
      100,
      type,
      elc
    )
  },

  rasterStyleTileJSON(
    layer_id: number,
    shortid: string,
    sourceUrl: string,
    opacity: number,
    type = 'raster'
  ): {
    layers: Array<{
      id: string
      maxzoom: number
      metadata: {
        'maphubs:globalid': string
        'maphubs:layer_id': number
      }
      minzoom: number
      paint: {
        'raster-opacity': number
      }
      source: string
      type: string
    }>
    sources: mapboxgl.Sources
  } {
    opacity = opacity / 100
    const style = {
      sources: {},
      layers: [
        {
          id: 'omh-raster-' + shortid,
          type: 'raster',
          metadata: {
            'maphubs:layer_id': layer_id,
            'maphubs:globalid': shortid
          },
          source: 'omh-' + shortid,
          minzoom: 0,
          maxzoom: 18,
          paint: {
            'raster-opacity': opacity
          }
        }
      ]
    }
    style.sources['omh-' + shortid] = {
      type,
      url: sourceUrl,
      tileSize: 256
    }
    return style
  },

  rasterStyleWithOpacity(
    layer_id: number,
    shortid: string,
    elc: Record<string, any>,
    opacity: number,
    type = 'raster'
  ): mapboxgl.Style {
    opacity = opacity / 100

    const rasterLayer: mapboxgl.RasterLayer = {
      id: 'omh-raster-' + shortid,
      type: 'raster',
      metadata: {
        'maphubs:layer_id': layer_id,
        'maphubs:globalid': shortid
      },
      source: 'omh-' + shortid,
      minzoom: 0,
      maxzoom: 18,
      paint: {
        'raster-opacity': opacity
      }
    }
    const style = {
      version: 8,
      sources: {},
      layers: [rasterLayer]
    }
    const metadata = {}
    for (const key of Object.keys(elc)) {
      metadata[`maphubs:${key}`] = elc[key]
    }
    style.sources['omh-' + shortid] = {
      type,
      minzoom: elc.minzoom || 0,
      maxzoom: elc.maxzoom || 22,
      tiles: elc.tiles,
      tileSize: elc.tileSize || 256,
      metadata: metadata
    }
    return style
  },

  multiRasterStyleWithOpacity(
    layer_id: number,
    shortid: string,
    layers: Array<Record<string, any>>,
    opacity: number,
    type = 'raster'
  ): mapboxgl.Style {
    opacity = opacity / 100
    const style = {
      version: 8,
      sources: {},
      layers: []
    }
    // eslint-disable-next-line unicorn/no-array-for-each
    layers.forEach((raster, i) => {
      const id = `omh-raster-${i}-${shortid}`
      style.layers.push({
        id,
        type: 'raster',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        source: id,
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': opacity
        }
      })
      style.sources[id] = {
        type,
        tiles: raster.tiles,
        tileSize: 256
      }
    })
    return style
  }
}
