// @flow
import type {GLStyle} from '../../../types/mapbox-gl-style'
module.exports = (oldId: string, newId: string, style: GLStyle) => {

  // source
  if (style.sources[`omh-${oldId}`]) {
    style.sources[`omh-${newId}`] = style.sources[`omh-${oldId}`]
    delete style.sources[`omh-${oldId}`]
    if (style.sources[`omh-${newId}`].type === 'vector' &&
      style.sources[`omh-${newId}`].url &&
      style.sources[`omh-${newId}`].url.endsWith('tile.json') &&
      style.sources[`omh-${newId}`].url.startsWith('{MAPHUBS_DOMAIN}')
    ) {
      style.sources[`omh-${newId}`].url = `{MAPHUBS_DOMAIN}/api/lyr/${newId}/tile.json`
    }
  }

  if (style.layers) {
    style.layers = style.layers.map(layer => {
      // layer id
      layer.id = layer.id.replace(oldId, newId)
      // globalid in metadata
      if (layer.metadata && layer.metadata['maphubs:globalid']) {
        layer.metadata['maphubs:globalid'] = newId
      }
      // source
      if (layer.source) {
        layer.source = `omh-${newId}`
      }
      return layer
    })
  }
  return style
}
