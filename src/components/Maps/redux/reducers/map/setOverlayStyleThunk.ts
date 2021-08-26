import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppState } from '../../store'
import DebugService from '../../../lib/debug'
import _findIndex from 'lodash.findindex'
import _cloneDeep from 'lodash.clonedeep'
import _difference from 'lodash.difference'
import _map from 'lodash.map'
import _find from 'lodash.find'
import _isequal from 'lodash.isequal'
import _intersection from 'lodash.intersection'
import mapboxgl from 'mapbox-gl'
import Bluebird from 'bluebird'
import { SourceWithUrl } from '../../../Map/Sources/types/SourceWithUrl'

import { removeLayers, removeSources, addLayers, loadSources } from './helpers'

const debug = DebugService('SetOverlayStyleThunk')

/**
 * Attempt to optimize layers, put labels on top of other layer types
 * @param {*} glStyle
 */
const optimizeLayerOrder = (glStyle: mapboxgl.Style) => {
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

const setOverlayStyleThunk = createAsyncThunk(
  'map/setOverlayStyle',
  async (
    args: {
      overlayStyle: mapboxgl.Style
      optimizeLayers: boolean
    },
    { getState }
  ): Promise<{
    overlayMapStyle: mapboxgl.Style
    glStyle: mapboxgl.Style
  }> => {
    const appState = getState() as AppState
    const overlayMapStyle = appState.map.overlayMapStyle
    const baseMapStyle = appState.baseMap.baseMapStyle
    const mapboxMap = appState.map.mapboxMap
    let glStyle = appState.map.glStyle
    const overlayStyle = _cloneDeep(args.overlayStyle)

    if (!glStyle) glStyle = baseMapStyle

    const sourceState = {
      allowLayersToMoveMap: appState.map.allowLayersToMoveMap,
      editing: appState.dataEditor.editing,
      mapboxMap,
      addSource: (key: string, source: SourceWithUrl) => {
        glStyle.sources[key] = source as mapboxgl.AnySourceData
      },
      addLayer: (layer: mapboxgl.AnyLayer, position?: number) => {
        const index = _findIndex(glStyle.layers, {
          id: layer.id
        })

        if (index >= 0) {
          // replace existing layer
          glStyle.layers[index] = layer
        } else if (position && position >= 0) {
          // let index = _findIndex(this.glStyle.layers, {id: beforeLayer});
          glStyle.layers.splice(position, 0, layer)
        } else {
          glStyle.layers.push(layer)
        }
      },
      addLayerBefore: (layer: mapboxgl.AnyLayer, beforeLayer: string) => {
        const index = _findIndex(glStyle.layers, {
          id: beforeLayer
        })

        if (index && index >= 0) {
          glStyle.layers.splice(index, 0, layer)
        } else {
          glStyle.layers.push(layer)
        }
      }
    }

    if (args.optimizeLayers) {
      overlayStyle.layers = optimizeLayerOrder(overlayStyle)
    }

    const positionOffset = baseMapStyle.layers.length
    let customSources, customSourceLayers
    let allUpdatesAreCustomSources

    if (overlayMapStyle) {
      // find layers to add and remove
      const prevLayerIds = _map(overlayMapStyle.layers, 'id')

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
      const prevSources = Object.keys(overlayMapStyle.sources)
      const newSources = Object.keys(overlayStyle.sources)

      const sourcesToRemove = _difference(prevSources, newSources)

      const sourcesToAdd = _difference(newSources, prevSources)

      // find sources to update
      const sourcesInBoth = _intersection(prevSources, newSources)

      const sourcesToUpdate = []
      for (const key of sourcesInBoth) {
        const prevSource = overlayMapStyle.sources[key]
        const newSource = overlayStyle.sources[key]

        if (!_isequal(prevSource, newSource)) {
          sourcesToUpdate.push(key)
        }
      }

      // find layers to update
      const layersInBoth = _intersection(prevLayerIds, newLayerIds)

      const layersToUpdate = []
      for (const id of layersInBoth) {
        const prevLayer = _find(overlayMapStyle.layers, {
          id
        })

        const newLayer = _find(overlayStyle.layers, {
          id
        })

        // ? not used
        //const source = overlayStyle.sources[newLayer.source]

        if (!_isequal(prevLayer, newLayer)) {
          layersToUpdate.push(id)
        }

        const prevLayerPosition = _findIndex(overlayMapStyle.layers, {
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

      debug.log(`removing ${layersToRemove.length} layers`)

      debug.log(`removing ${sourcesToRemove.length} sources`)

      debug.log(`adding ${layersToAddWithPosition.length} layers`)

      debug.log(`adding ${sourcesToAdd.length} sources`)

      // run removals/additions
      removeLayers(layersToRemove, overlayMapStyle, glStyle)
      removeSources(sourcesToRemove, overlayMapStyle, glStyle)
      customSources = await loadSources(sourcesToAdd, overlayStyle, sourceState)
      customSourceLayers = await addLayers(
        layersToAddWithPosition,
        overlayStyle,
        sourceState
      )

      debug.log(`updating ${layersToUpdate.length} layers`)

      debug.log(`updating ${sourcesToUpdate.length} sources`)

      // run updates
      removeLayers(layersToUpdate, overlayMapStyle, glStyle)
      removeSources(sourcesToUpdate, overlayMapStyle, glStyle)
      const customSourcesToUpdate = await loadSources(
        sourcesToUpdate,
        overlayStyle,
        sourceState
      )
      customSources = [...customSources, ...customSourcesToUpdate]
      customSourceLayers = [
        ...customSourceLayers,
        ...(await addLayers(
          layersToUpdateWithPosition,
          overlayStyle,
          sourceState
        ))
      ]

      debug.log(`custom sources: ${customSources.length}`)

      debug.log(`custom source layers ${customSourceLayers.length}`)

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
      debug.log('initial layer load')

      const newSources = Object.keys(overlayStyle.sources)
      const newLayersToAdd = overlayStyle.layers.map((layer, i) => {
        return {
          id: layer.id,
          position: positionOffset + i
        }
      })
      customSources = await loadSources(newSources, overlayStyle, sourceState)
      customSourceLayers = await addLayers(
        newLayersToAdd,
        overlayStyle,
        sourceState
      )
    }

    if (mapboxMap) {
      try {
        const customSourceRender = async () => {
          debug.log('customSourceRender')

          if (customSources) {
            for (const customSource of customSources) {
              customSource.driver.load(
                customSource.key,
                customSource.source,
                sourceState
              )
            }
          }

          if (customSourceLayers) {
            // eslint-disable-next-line unicorn/no-array-method-this-argument
            await Bluebird.map(customSourceLayers, (customSourceLayer) => {
              return customSourceLayer.driver.addLayer(
                customSourceLayer.layer,
                customSourceLayer.source,
                customSourceLayer.position,
                sourceState
              )
            })
          }

          mapboxMap.off('styledata', customSourceRender)
        }

        if (allUpdatesAreCustomSources) {
          debug.log('only updating custom sources')

          customSourceRender()
        } else {
          debug.log('setting map style')

          mapboxMap.on('styledata', customSourceRender)
          mapboxMap.setStyle(glStyle)
        }
      } catch (err) {
        debug.log(err)
      }
    }
    // finally update the map
    return { overlayMapStyle: overlayStyle, glStyle }
  }
)
export { setOverlayStyleThunk }
