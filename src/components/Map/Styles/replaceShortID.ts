import mapboxgl from 'mapbox-gl'

export default (
  oldId: string,
  newId: string,
  style: mapboxgl.Style
): mapboxgl.Style => {
  // source
  if (style.sources[`omh-${oldId}`]) {
    style.sources[`omh-${newId}`] = style.sources[
      `omh-${oldId}`
    ] as mapboxgl.VectorSource
    delete style.sources[`omh-${oldId}`]
    const updatedSource = style.sources[`omh-${newId}`] as mapboxgl.VectorSource
    if (
      updatedSource.type === 'vector' &&
      updatedSource.url &&
      updatedSource.url.endsWith('tile.json') &&
      updatedSource.url.startsWith('{MAPHUBS_DOMAIN}')
    ) {
      updatedSource.url = `{MAPHUBS_DOMAIN}/api/lyr/${newId}/tile.json`
    }
    style.sources[`omh-${newId}`] = updatedSource
  }

  if (style.layers) {
    style.layers = style.layers.map((layer: mapboxgl.FillLayer) => {
      if (layer.source === `omh-${oldId}`) {
        // layer id
        layer.id = layer.id.replace(oldId, newId)

        // globalid in metadata
        if (layer.metadata && layer.metadata['maphubs:globalid']) {
          layer.metadata['maphubs:globalid'] = newId
        }

        // source
        layer.source = `omh-${newId}`
      }

      return layer
    })
  }

  return style
}
