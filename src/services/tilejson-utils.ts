import { NextApiRequest, NextApiResponse } from 'next'
import { Layer } from '../types/layer'
import urlUtil from './url-util'
import Locales from './locales'
import slugify from 'slugify'

const completeLayerTileJSONRequest = (
  req: NextApiRequest,
  res: NextApiResponse,
  layer: Layer,
  locale: string
): void => {
  if (!layer) {
    return res.status(404).send('TileJSON not supported for this layer')
  }

  const baseUrl = urlUtil.getBaseUrl()
  const name = Locales.getLocaleStringObject(locale, layer.name) || ''
  const description =
    Locales.getLocaleStringObject(locale, layer.description) || ''
  const source = Locales.getLocaleStringObject(locale, layer.source) || ''
  const legend = layer.legend_html ? layer.legend_html : name

  if (layer.is_external && layer.external_layer_config.type === 'raster') {
    // eslint-disable-next-line unicorn/numeric-separators-style
    let bounds = [-180, -85.05112877980659, 180, 85.0511287798066]

    if (layer.external_layer_config.bounds) {
      bounds = layer.external_layer_config.bounds
    } else if (layer.extent_bbox) {
      bounds = layer.extent_bbox
    }

    const minzoom = layer.external_layer_config.minzoom
      ? Number.parseInt(layer.external_layer_config.minzoom, 10)
      : 0
    const maxzoom = layer.external_layer_config.maxzoom
      ? Number.parseInt(layer.external_layer_config.maxzoom, 10)
      : 19
    const centerZoom = Math.floor((maxzoom - minzoom) / 2)
    const centerX = Math.floor((bounds[2] - bounds[0]) / 2)
    const centerY = Math.floor((bounds[3] - bounds[1]) / 2)
    const legend = layer.legend_html ? layer.legend_html : name
    const tileJSON = {
      attribution: source,
      autoscale: true,
      bounds,
      center: [centerX, centerY, centerZoom],
      created: layer.last_updated,
      description,
      legend,
      filesize: 0,
      id: 'omh-' + layer.layer_id,
      maxzoom,
      minzoom,
      name,
      private: layer.private,
      scheme: 'xyz',
      tilejson: '2.2.0',
      tiles: layer.external_layer_config.tiles,
      webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
    }
    return res.status(200).send(tileJSON)
  } else if (
    layer.is_external &&
    layer.external_layer_config.type === 'vector'
  ) {
    // eslint-disable-next-line unicorn/numeric-separators-style
    let bounds = [-180, -85.05112877980659, 180, 85.0511287798066]
    if (layer.extent_bbox) bounds = layer.extent_bbox
    const minzoom = layer.external_layer_config.minzoom
      ? Number.parseInt(layer.external_layer_config.minzoom, 10)
      : 0
    const maxzoom = layer.external_layer_config.maxzoom
      ? Number.parseInt(layer.external_layer_config.maxzoom, 10)
      : 19
    const centerZoom = Math.floor((maxzoom - minzoom) / 2)
    const centerX = Math.floor((bounds[2] - bounds[0]) / 2)
    const centerY = Math.floor((bounds[3] - bounds[1]) / 2)
    const tileJSON = {
      attribution: source,
      bounds,
      center: [centerX, centerY, centerZoom],
      created: layer.last_updated,
      updated: layer.last_updated,
      description,
      legend,
      format: 'pbf',
      id: 'omh-' + layer.layer_id,
      group_id: layer.owned_by_group_id,
      maxzoom,
      minzoom,
      name,
      private: layer.private,
      scheme: 'xyz',
      tilejson: '2.2.0',
      tiles: layer.external_layer_config.tiles,
      webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
    }
    return res.status(200).send(tileJSON)
  } else if (!layer.is_external) {
    // eslint-disable-next-line unicorn/numeric-separators-style
    let bounds = [-180, -85.05112877980659, 180, 85.0511287798066]
    if (layer.extent_bbox) bounds = layer.extent_bbox
    const minzoom = 0
    const maxzoom = 19
    const centerZoom = Math.floor((maxzoom - minzoom) / 2)
    const centerX = Math.floor((bounds[2] - bounds[0]) / 2)
    const centerY = Math.floor((bounds[3] - bounds[1]) / 2)
    const uri = `/api/tiles/lyr/${layer.shortid}/{z}/{x}/{y}.pbf`
    const tileJSON = {
      attribution: source,
      bounds,
      center: [centerX, centerY, centerZoom],
      created: layer.last_updated,
      updated: layer.last_updated,
      description,
      legend,
      format: 'pbf',
      id: 'omh-' + layer.layer_id,
      group_id: layer.owned_by_group_id,
      maxzoom,
      minzoom,
      name,
      private: layer.private,
      scheme: 'xyz',
      tilejson: '2.2.0',
      tiles: [uri],
      data:
        baseUrl +
        '/api/layer/' +
        layer.layer_id +
        '/export/json/' +
        slugify(name) +
        '.geojson',
      webpage: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(name)
    }
    return res.status(200).send(tileJSON)
  } else {
    return res.status(404).send('TileJSON not supported for this layer')
  }
}
export { completeLayerTileJSONRequest }
