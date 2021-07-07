import _findIndex from 'lodash.findindex'
import _remove from 'lodash.remove'
import _cloneDeep from 'lodash.clonedeep'
import _difference from 'lodash.difference'
import _map from 'lodash.map'
import _find from 'lodash.find'
import _isequal from 'lodash.isequal'
import _intersection from 'lodash.intersection'
import Promise from 'bluebird'
import LayerSources from '../Sources'
import mapboxgl from 'mapbox-gl'
type SourceDriverType = {
  driver: Record<string, any>
  custom: boolean
  layer?: Record<string, any>
  source?: Record<string, any>
  position?: number
}

/**
 * Attempt to optimize layers, put labels on top of other layer types
 * @param {*} glStyle
 */
function optimizeLayerOrder(glStyle: mapboxgl.Style) {
  const regularLayers = []
  const labelLayers = []
  for (const layer of glStyle.layers) {
    if (layer.type === 'symbol') {
      labelLayers.push(layer)
    } else {
      regularLayers.push(layer)
    }
  }
  return [...regularLayers, ...labelLayers]
}

export default {
  setBaseMapStyle(style: mapboxgl.Style, update = true): void {
    style = _cloneDeep(style)

    if (this.overlayMapStyle) {
      // need to update in place to avoid redrawing overlay layers
      const sourcesToAdd = Object.keys(style.sources)
      const layersToAdd = style.layers

      if (this.baseMapStyle) {
        // need to clear previous base map
        for (const element of Object.keys(this.baseMapStyle.sources)) {
          this.removeSource(element)
        }

        for (const element of _map(this.baseMapStyle.layers, 'id')) {
          this.removeLayer(element)
        }
      }

      for (const key of sourcesToAdd) {
        const source = style.sources[key]
        this.addSource(key, source)
      }
      // FIXME: this will reset layers showing below base map labels
      const updatedLayers = [...layersToAdd, ...this.glStyle.layers]
      this.glStyle.layers = updatedLayers
    } else {
      // we can just overwrite the base map and let mapbox-gl do the diff
      this.glStyle = _cloneDeep(style)
    }

    this.baseMapStyle = style
    // don't clear glyphs/sprite, prevents full redraw when switching to raster base maps
    this.glStyle.glyphs = style.glyphs ? style.glyphs : this.glStyle.glyphs
    this.glStyle.sprite = style.sprite ? style.sprite : this.glStyle.sprite
    this.glStyle.metadata = style.metadata

    if (this.map && update) {
      try {
        this.map.setStyle(this.glStyle)
      } catch (err) {
        this.debugLog(err)
      }
    }
  },

  /**
   * Complete reload
   * This is inefficient, use updateLayer when possible
   */
  async reloadStyle() {
    // start with a fresh copy of the base map
    this.glStyle = _cloneDeep(this.baseMapStyle)
    const layerIds = []
    const positionOffset = this.baseMapStyle.layers.length
    const layerIdsWithPosition = this.overlayMapStyle.layers.map((layer, i) => {
      layerIds.push(layer.id)
      return {
        id: layer.id,
        position: positionOffset + i
      }
    })
    const sourceKeys = Object.keys(this.overlayMapStyle.sources)
    this.removeLayers(layerIds, this.overlayMapStyle)
    this.removeSources(sourceKeys, this.overlayMapStyle)
    const customSources = await this.loadSources(
      sourceKeys,
      this.overlayMapStyle
    )
    const customSourceLayers = await this.addLayers(
      layerIdsWithPosition,
      this.overlayMapStyle
    )

    if (this.map) {
      try {
        const map = this.map

        const customSourceRender = async () => {
          if (customSources) {
            for (const customSource of customSources) {
              customSource.driver.load(
                customSource.key,
                customSource.source,
                this
              )
            }
          }

          if (customSourceLayers) {
            await Promise.map(customSourceLayers, (customSourceLayer) => {
              return customSourceLayer.driver.addLayer(
                customSourceLayer.layer,
                customSourceLayer.source,
                customSourceLayer.position,
                this
              )
            })
          }

          map.off('styledata', customSourceRender)
        }

        map.on('styledata', customSourceRender)
        map.setStyle(this.glStyle)
      } catch (err) {
        this.debugLog(err)
      }
    }
  },

  async setOverlayStyle(
    overlayStyle: Record<string, any>,
    optimizeLayers: boolean
  ) {
    const _this = this

    overlayStyle = _cloneDeep(overlayStyle)

    if (optimizeLayers) {
      overlayStyle.layers = optimizeLayerOrder(overlayStyle)
    }

    const positionOffset = this.baseMapStyle.layers.length
    let customSources, customSourceLayers
    let allUpdatesAreCustomSources

    if (this.overlayMapStyle) {
      // find layers to add and remove
      const prevLayerIds = _map(this.overlayMapStyle.layers, 'id')

      const newLayerIds = _map(overlayStyle.layers, 'id')

      const layersToRemove = _difference(prevLayerIds, newLayerIds)

      const layersToAdd = _difference(newLayerIds, prevLayerIds)

      const layersToAddWithPosition = []
      for (const [i, layer] of overlayStyle.layers.entries()) {
        if (layersToAdd.includes(layer.id)) {
          layersToAddWithPosition.push({
            id: layer.id,
            position: positionOffset + i
          })
        }
      }
      // find sources to add and remove
      const prevSources = Object.keys(this.overlayMapStyle.sources)
      const newSources = Object.keys(overlayStyle.sources)

      const sourcesToRemove = _difference(prevSources, newSources)

      const sourcesToAdd = _difference(newSources, prevSources)

      // find sources to update
      const sourcesInBoth = _intersection(prevSources, newSources)

      const sourcesToUpdate = []
      for (const key of sourcesInBoth) {
        const prevSource = this.overlayMapStyle.sources[key]
        const newSource = overlayStyle.sources[key]

        if (!_isequal(prevSource, newSource)) {
          sourcesToUpdate.push(key)
        }
      }

      // find layers to update
      const layersInBoth = _intersection(prevLayerIds, newLayerIds)

      const layersToUpdate = []
      for (const id of layersInBoth) {
        const prevLayer = _find(this.overlayMapStyle.layers, {
          id
        })

        const newLayer = _find(overlayStyle.layers, {
          id
        })

        const source = overlayStyle.sources[newLayer.source]

        if (!_isequal(prevLayer, newLayer)) {
          layersToUpdate.push(id)
        }

        const prevLayerPosition = _findIndex(this.overlayMapStyle.layers, {
          id
        })

        const newLayerPosition = _findIndex(overlayStyle.layers, {
          id
        })

        if (prevLayerPosition !== newLayerPosition) {
          layersToUpdate.push(id)
        }
      }
      const layersToUpdateWithPosition = []
      for (const [i, layer] of overlayStyle.layers.entries()) {
        if (layersToUpdate.includes(layer.id)) {
          layersToUpdateWithPosition.push({
            id: layer.id,
            position: positionOffset + i
          })
        }
      }

      _this.debugLog(`removing ${layersToRemove.length} layers`)

      _this.debugLog(`removing ${sourcesToRemove.length} sources`)

      _this.debugLog(`adding ${layersToAddWithPosition.length} layers`)

      _this.debugLog(`adding ${sourcesToAdd.length} sources`)

      // run removals/additions
      this.removeLayers(layersToRemove, this.overlayMapStyle)
      this.removeSources(sourcesToRemove, this.overlayMapStyle)
      customSources = await this.loadSources(sourcesToAdd, overlayStyle)
      customSourceLayers = await this.addLayers(
        layersToAddWithPosition,
        overlayStyle
      )

      _this.debugLog(`updating ${layersToUpdate.length} layers`)

      _this.debugLog(`updating ${sourcesToUpdate.length} sources`)

      // run updates
      this.removeLayers(layersToUpdate, this.overlayMapStyle)
      this.removeSources(sourcesToUpdate, this.overlayMapStyle)
      const customSourcesToUpdate = await this.loadSources(
        sourcesToUpdate,
        overlayStyle
      )
      customSources = [...customSources, ...customSourcesToUpdate]
      customSourceLayers = [
        ...customSourceLayers,
        ...(await this.addLayers(layersToUpdateWithPosition, overlayStyle))
      ]

      _this.debugLog(`custom sources: ${customSources.length}`)

      _this.debugLog(`custom source layers ${customSourceLayers.length}`)

      if (
        customSourcesToUpdate.length > 0 &&
        customSourcesToUpdate.length === customSources.length
      ) {
        // if all the layers are also custom
        if (layersToUpdateWithPosition.length === customSourceLayers.length) {
          allUpdatesAreCustomSources = true
        } // else has regular layers
      } else if (
        customSourceLayers.length > 0 &&
        layersToUpdateWithPosition.length === customSourceLayers.length &&
        customSourcesToUpdate.length === customSources.length
      ) {
        allUpdatesAreCustomSources = true
      } // else has regular sources
    } else {
      // initial load of overlays (nothing to replace)
      _this.debugLog('initial layer load')

      const newSources = Object.keys(overlayStyle.sources)
      const newLayersToAdd = overlayStyle.layers.map((layer, i) => {
        return {
          id: layer.id,
          position: positionOffset + i
        }
      })
      customSources = await this.loadSources(newSources, overlayStyle)
      customSourceLayers = await this.addLayers(newLayersToAdd, overlayStyle)
    }

    // finally update the map
    this.overlayMapStyle = overlayStyle

    if (this.map) {
      try {
        const map = this.map

        const customSourceRender = async () => {
          _this.debugLog('customSourceRender')

          if (customSources) {
            for (const customSource of customSources) {
              customSource.driver.load(
                customSource.key,
                customSource.source,
                _this
              )
            }
          }

          if (customSourceLayers) {
            await Promise.map(customSourceLayers, (customSourceLayer) => {
              return customSourceLayer.driver.addLayer(
                customSourceLayer.layer,
                customSourceLayer.source,
                customSourceLayer.position,
                _this
              )
            })
          }

          map.off('styledata', customSourceRender)
        }

        if (allUpdatesAreCustomSources) {
          _this.debugLog('only updating custom sources')

          customSourceRender()
        } else {
          _this.debugLog('setting map style')

          map.on('styledata', customSourceRender)
          map.setStyle(this.glStyle)
        }
      } catch (err) {
        this.debugLog(err)
      }
    }
  },

  async loadSources(
    sourceKeys: Array<string>,
    fromStyle: mapboxgl.Style
  ): Promise<Array<any>> {
    const customSources = []
    await Promise.map(sourceKeys, async (key) => {
      this.debugLog(`loading source: ${key}`)

      const source = fromStyle.sources[key]

      if (source.type === 'arcgisraster') {
        source.type = 'raster'
        source.tiles = [`${source.url.replace('?f=json', '')}/tile/{z}/{y}/{x}`]
        delete source.url
      }

      const sourceDriver = LayerSources.getSource(key, source)

      if (sourceDriver.custom) {
        this.debugLog(`found custom source: ${key}`)

        customSources.push(sourceDriver)
      } else {
        return sourceDriver.driver.load(key, source, this)
      }
    })
    return customSources
  },

  removeSources(sourceKeys: Array<string>, fromStyle: mapboxgl.Style): void {
    const { debugLog } = this
    for (const key of sourceKeys) {
      debugLog(`removing source: ${key}`)
      const source = fromStyle.sources[key]
      LayerSources.getSource(key, source).driver.remove(key, this)
    }
  },

  async addLayers(
    layers: Array<{
      id: number
      position: number
    }>,
    fromStyle: mapboxgl.Style
  ): Promise<Array<any | SourceDriverType>> {
    const customSourceLayers = []
    await Promise.map(layers, (layerToAdd) => {
      this.debugLog(`adding layer: ${layerToAdd.id}`)

      try {
        const layer = _find(fromStyle.layers, {
          id: layerToAdd.id
        })

        const source = fromStyle.sources[layer.source]
        const sourceDriver: SourceDriverType = LayerSources.getSource(
          layer.source,
          source
        )

        if (sourceDriver.custom) {
          this.debugLog(`custom source layer: ${layerToAdd.id}`)

          Object.assign(sourceDriver, {
            layer,
            source,
            position: layerToAdd.position
          })
          customSourceLayers.push(sourceDriver)
        } else {
          return sourceDriver.driver.addLayer(
            layer,
            source,
            layerToAdd.position,
            this
          )
        }
      } catch (err) {
        this.debugLog('Failed to add layers')
        this.debugLog(err)
      }
    })
    return customSourceLayers
  },

  removeLayers(layersIDs: Array<string>, fromStyle: mapboxgl.Style): void {
    for (const id of layersIDs) {
      this.debugLog(`removing layer: ${id}`)

      const layer = _find(fromStyle.layers, {
        id
      })

      try {
        const source = fromStyle.sources[layer.source]
        LayerSources.getSource(layer.source, source).driver.removeLayer(
          layer,
          this
        )
      } catch (err) {
        this.debugLog('Failed to remove layer: ' + layer.id)
        this.debugLog(err)
      }
    }
  },

  addLayer(layer: mapboxgl.Layer, position?: number): void {
    const index = _findIndex(this.glStyle.layers, {
      id: layer.id
    })

    if (index >= 0) {
      // replace existing layer
      this.glStyle.layers[index] = layer
    } else if (position && position >= 0) {
      // let index = _findIndex(this.glStyle.layers, {id: beforeLayer});
      this.glStyle.layers.splice(position, 0, layer)
    } else {
      this.glStyle.layers.push(layer)
    }
  },

  addLayerBefore(layer: mapboxgl.Layer, beforeLayer: string): void {
    const index = _findIndex(this.glStyle.layers, {
      id: beforeLayer
    })

    if (index && index >= 0) {
      this.glStyle.layers.splice(index, 0, layer)
    } else {
      this.glStyle.layers.push(layer)
    }
  },

  removeLayer(id: string): void {
    _remove(this.glStyle.layers, {
      id
    })
  },

  addSource(key: string, source: GLSource): void {
    this.glStyle.sources[key] = source
  },

  removeSource(key: string): void {
    delete this.glStyle.sources[key]
  }
}
