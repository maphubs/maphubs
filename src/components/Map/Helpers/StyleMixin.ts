import _findIndex from 'lodash.findindex'
import _remove from 'lodash.remove'
import type { GLStyle, GLLayer, GLSource } from '../../../types/mapbox-gl-style'
import _cloneDeep from 'lodash.clonedeep'
import _difference from 'lodash.difference'
import _map from 'lodash.map'
import _find from 'lodash.find'
import _isequal from 'lodash.isequal'
import _intersection from 'lodash.intersection'
import Promise from 'bluebird'
import LayerSources from '../Sources'
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
function optimizeLayerOrder(glStyle: Record<string, any>) {
  const regularLayers = []
  const labelLayers = []
  glStyle.layers.forEach((layer) => {
    if (layer.type === 'symbol') {
      labelLayers.push(layer)
    } else {
      regularLayers.push(layer)
    }
  })
  return regularLayers.concat(labelLayers)
}

export default {
  setBaseMapStyle(style: GLStyle, update: boolean = true) {
    style = _cloneDeep(style)

    if (this.overlayMapStyle) {
      // need to update in place to avoid redrawing overlay layers
      const sourcesToAdd = Object.keys(style.sources)
      const layersToAdd = style.layers

      if (this.baseMapStyle) {
        // need to clear previous base map
        Object.keys(this.baseMapStyle.sources).forEach(this.removeSource)

        _map(this.baseMapStyle.layers, 'id').forEach(this.removeLayer)
      }

      sourcesToAdd.forEach((key) => {
        const source = style.sources[key]
        this.addSource(key, source)
      })
      // FIXME: this will reset layers showing below base map labels
      const updatedLayers = layersToAdd.concat(this.glStyle.layers)
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
    const _this = this

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
            customSources.forEach((customSource) => {
              customSource.driver.load(
                customSource.key,
                customSource.source,
                _this
              )
            })
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
      overlayStyle.layers.forEach((layer, i) => {
        if (layersToAdd.includes(layer.id)) {
          layersToAddWithPosition.push({
            id: layer.id,
            position: positionOffset + i
          })
        }
      })
      // find sources to add and remove
      const prevSources = Object.keys(this.overlayMapStyle.sources)
      const newSources = Object.keys(overlayStyle.sources)

      const sourcesToRemove = _difference(prevSources, newSources)

      const sourcesToAdd = _difference(newSources, prevSources)

      // find sources to update
      const sourcesInBoth = _intersection(prevSources, newSources)

      const sourcesToUpdate = []
      sourcesInBoth.forEach((key) => {
        const prevSource = this.overlayMapStyle.sources[key]
        const newSource = overlayStyle.sources[key]

        if (!_isequal(prevSource, newSource)) {
          sourcesToUpdate.push(key)
        }
      })

      // find layers to update
      const layersInBoth = _intersection(prevLayerIds, newLayerIds)

      const layersToUpdate = []
      layersInBoth.forEach((id) => {
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
      })
      const layersToUpdateWithPosition = []
      overlayStyle.layers.forEach((layer, i) => {
        if (layersToUpdate.includes(layer.id)) {
          layersToUpdateWithPosition.push({
            id: layer.id,
            position: positionOffset + i
          })
        }
      })

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
      customSources = customSources.concat(customSourcesToUpdate)
      customSourceLayers = customSourceLayers.concat(
        await this.addLayers(layersToUpdateWithPosition, overlayStyle)
      )

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
        layersToUpdateWithPosition.length === customSourceLayers.length
      ) {
        if (customSourcesToUpdate.length === customSources.length) {
          allUpdatesAreCustomSources = true
        } // else has regular sources
      }
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
            customSources.forEach((customSource) => {
              customSource.driver.load(
                customSource.key,
                customSource.source,
                _this
              )
            })
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
    fromStyle: GLStyle
  ): Promise<Array<any>> {
    const _this = this

    const customSources = []
    await Promise.map(sourceKeys, async (key) => {
      _this.debugLog(`loading source: ${key}`)

      const source = fromStyle.sources[key]

      if (source.type === 'arcgisraster') {
        source.type = 'raster'
        source.tiles = [`${source.url.replace('?f=json', '')}/tile/{z}/{y}/{x}`]
        delete source.url
      }

      const sourceDriver = LayerSources.getSource(key, source)

      if (sourceDriver.custom) {
        _this.debugLog(`found custom source: ${key}`)

        customSources.push(sourceDriver)
      } else {
        return sourceDriver.driver.load(key, source, _this)
      }
    })
    return customSources
  },

  removeSources(sourceKeys: Array<string>, fromStyle: GLStyle) {
    const _this = this

    sourceKeys.map((key) => {
      _this.debugLog(`removing source: ${key}`)

      const source = fromStyle.sources[key]
      return LayerSources.getSource(key, source).driver.remove(key, _this)
    })
  },

  async addLayers(
    layers: Array<{
      id: number
      position: number
    }>,
    fromStyle: GLStyle
  ): Promise<Array<any | SourceDriverType>> {
    const _this = this

    const customSourceLayers = []
    await Promise.map(layers, (layerToAdd) => {
      _this.debugLog(`adding layer: ${layerToAdd.id}`)

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
          _this.debugLog(`custom source layer: ${layerToAdd.id}`)

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
            _this
          )
        }
      } catch (err) {
        _this.debugLog('Failed to add layers')

        _this.debugLog(err)
      }
    })
    return customSourceLayers
  },

  removeLayers(layersIDs: Array<string>, fromStyle: GLStyle) {
    const _this = this

    layersIDs.forEach((id) => {
      _this.debugLog(`removing layer: ${id}`)

      const layer = _find(fromStyle.layers, {
        id
      })

      try {
        const source = fromStyle.sources[layer.source]
        LayerSources.getSource(layer.source, source).driver.removeLayer(
          layer,
          _this
        )
      } catch (err) {
        _this.debugLog('Failed to remove layer: ' + layer.id)

        _this.debugLog(err)
      }
    })
  },

  addLayer(layer: GLLayer, position?: number) {
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

  addLayerBefore(layer: GLLayer, beforeLayer: string) {
    const index = _findIndex(this.glStyle.layers, {
      id: beforeLayer
    })

    if (index && index >= 0) {
      this.glStyle.layers.splice(index, 0, layer)
    } else {
      this.glStyle.layers.push(layer)
    }
  },

  removeLayer(id: string) {
    _remove(this.glStyle.layers, {
      id
    })
  },

  addSource(key: string, source: GLSource) {
    this.glStyle.sources[key] = source
  },

  removeSource(key: string) {
    delete this.glStyle.sources[key]
  }
}