import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppState } from '../../store'
import _cloneDeep from 'lodash.clonedeep'
import _findIndex from 'lodash.findindex'
import Bluebird from 'bluebird'
import DebugService from '../../../lib/debug'
import { SourceWithUrl } from '../../../Map/Sources/types/SourceWithUrl'
import { removeLayers, removeSources, addLayers, loadSources } from './helpers'

const debug = DebugService('ReloadStyleThunk')
/**
 * Complete reload
 * This is inefficient, use updateLayer when possible
 */

const reloadStyleThunk = createAsyncThunk(
  'map/reloadStyle',
  async (
    args: unknown,
    { getState }
  ): Promise<{
    glStyle: mapboxgl.Style
  }> => {
    const appState = getState() as AppState
    const overlayMapStyle = appState.map.overlayMapStyle
    const baseMapStyle = appState.baseMap.baseMapStyle
    const mapboxMap = appState.map.mapboxMap

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

    // start with a fresh copy of the base map
    const glStyle = _cloneDeep(baseMapStyle)
    const layerIds = []
    const positionOffset = baseMapStyle.layers.length
    const layerIdsWithPosition = overlayMapStyle.layers.map((layer, i) => {
      layerIds.push(layer.id)
      return {
        id: layer.id,
        position: positionOffset + i
      }
    })
    const sourceKeys = Object.keys(overlayMapStyle.sources)
    removeLayers(layerIds, overlayMapStyle, glStyle)
    removeSources(sourceKeys, overlayMapStyle, glStyle)
    const customSources = await loadSources(
      sourceKeys,
      overlayMapStyle,
      sourceState
    )
    const customSourceLayers = await addLayers(
      layerIdsWithPosition,
      overlayMapStyle,
      sourceState
    )

    if (mapboxMap) {
      try {
        const customSourceRender = async () => {
          if (customSources) {
            for (const customSource of customSources) {
              customSource.driver.load(
                customSource.key,
                customSource.source as SourceWithUrl,
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

        mapboxMap.on('styledata', customSourceRender)
        mapboxMap.setStyle(glStyle)
      } catch (err) {
        debug.log(err)
      }
    }
    return { glStyle }
  }
)
export { reloadStyleThunk }
