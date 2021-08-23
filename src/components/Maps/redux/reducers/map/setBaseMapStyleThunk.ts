import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppState } from '../../store'
import _cloneDeep from 'lodash.clonedeep'
import _map from 'lodash.map'
import _remove from 'lodash.remove'
import DebugService from '../../../lib/debug'

const debug = DebugService('SetBaseMapStyleThunk')

/**
 * Called when the base map style is changed
 * goal is to effeciently apply the overlay styles to the new base map
 */

const setBaseMapStyleThunk = createAsyncThunk(
  'map/setBaseMapStyle',
  async (
    args: {
      style: mapboxgl.Style
      skipUpdate?: boolean
    },
    { getState }
  ): Promise<{
    glStyle: mapboxgl.Style
  }> => {
    const appState = getState() as AppState
    const overlayMapStyle = appState.map.overlayMapStyle
    const baseMapStyle = appState.baseMap.baseMapStyle
    const mapboxMap = appState.map.mapboxMap
    let glStyle = appState.map.glStyle

    const style = _cloneDeep(args.style)

    if (overlayMapStyle) {
      // need to update in place to avoid redrawing overlay layers
      const sourcesToAdd = Object.keys(style.sources)
      const layersToAdd = style.layers

      if (baseMapStyle) {
        // need to clear previous base map
        for (const element of Object.keys(baseMapStyle.sources)) {
          delete glStyle.sources[element]
        }

        for (const element of _map(baseMapStyle.layers, 'id')) {
          _remove(glStyle.layers, {
            id: element
          })
        }
      }

      for (const key of sourcesToAdd) {
        const source = style.sources[key]
        glStyle.sources[key] = source
      }
      // FIXME: this will reset layers showing below base map labels
      const updatedLayers = [...layersToAdd, ...glStyle.layers]
      glStyle.layers = updatedLayers
    } else {
      // we can just overwrite the base map and let mapbox-gl do the diff
      glStyle = _cloneDeep(style)
    }

    // ? base map style is updated in baseMap reducer?
    //baseMapStyle = style

    //* don't clear glyphs/sprite, prevents full redraw when switching to raster base maps
    glStyle.glyphs = style.glyphs || glStyle.glyphs
    glStyle.sprite = style.sprite || glStyle.sprite
    glStyle.metadata = style.metadata

    if (mapboxMap && !args.skipUpdate) {
      try {
        mapboxMap.setStyle(glStyle)
      } catch (err) {
        debug.log(err)
      }
    }
    return {
      glStyle
    }
  }
)
export { setBaseMapStyleThunk }
