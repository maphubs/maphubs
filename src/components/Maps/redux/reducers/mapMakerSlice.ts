import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import mapboxgl from 'mapbox-gl'
import { Layer } from '../../../../types/layer'

import { LocalizedString } from '../../../../types/LocalizedString'
import { MapPosition } from '../../../../types/map'
import MapStyles from '../../Map/Styles'
import _findIndex from 'lodash.findindex'
import _reject from 'lodash.reject'
import _find from 'lodash.find'
import { Group } from '../../../../types/group'

export interface MapMakerState {
  map_id?: number
  title?: LocalizedString
  mapLayers?: Array<Layer>
  mapStyle?: mapboxgl.Style
  position?: MapPosition
  settings?: Record<string, unknown>
  owned_by_group_id?: string
}

const initialState: MapMakerState = {
  map_id: -1,
  mapLayers: [],
  settings: {},
  mapStyle: null,
  position: null
}

export const mapMakerSlice = createSlice({
  name: 'mapMaker',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`

    initMapMaker: (state, action: PayloadAction<MapMakerState>) => {
      for (const key of Object.keys(action.payload)) {
        state[key] = action.payload[key]
      }
      const mapLayers = JSON.parse(JSON.stringify(action.payload.mapLayers))
      state.mapStyle = MapStyles.style.buildMapStyle(mapLayers)
      state.mapLayers = mapLayers
    },
    reset: (state, action: PayloadAction) => {
      state.map_id = -1
      state.mapLayers = []
      state.settings = {}
      state.mapStyle = null
      state.position = null
      state.editingLayer = false
    },

    setMapLayers: (
      state,
      action: PayloadAction<{ mapLayers: Array<Layer>; skipUpdate?: boolean }>
    ) => {
      const mapLayers = JSON.parse(JSON.stringify(action.payload.mapLayers))
      state.mapLayers = mapLayers
      if (!action.payload.skipUpdate) {
        state.mapStyle = MapStyles.style.buildMapStyle(
          JSON.parse(JSON.stringify(mapLayers))
        )
      }
    },

    setMapPosition: (
      state,
      action: PayloadAction<{ position: MapPosition }>
    ) => {
      // treat as immutable and clone
      state.position = JSON.parse(JSON.stringify(action.payload.position))
    },

    setSettings: (
      state,
      action: PayloadAction<{ settings: Record<string, unknown> }>
    ) => {
      // treat as immutable and clone
      state.settings = JSON.parse(JSON.stringify(action.payload.settings))
    },

    addToMap: (state, action: PayloadAction<{ layer: Layer }>) => {
      // check if the map already has this layer
      const { layer } = action.payload
      if (
        !_find(state.mapLayers, {
          layer_id: layer.layer_id
        })
      ) {
        // tell the map to make this layer visible
        layer.style = MapStyles.settings.set(layer.style, 'active', true)
        const layers = JSON.parse(JSON.stringify(state.mapLayers))

        if (layers) {
          layers.unshift(layer)
          state.mapStyle = MapStyles.style.buildMapStyle(
            JSON.parse(JSON.stringify(layers))
          )
          state.mapLayers = layers
        }
      }
    },

    removeFromMap: (state, action: PayloadAction<{ layer: Layer }>) => {
      const layers = _reject(state.mapLayers, {
        layer_id: action.payload.layer.layer_id
      })
      state.mapStyle = MapStyles.style.buildMapStyle(
        JSON.parse(JSON.stringify(layers))
      )
      state.mapLayers = layers
    },

    toggleVisibility: (state, action: PayloadAction<{ layer_id: number }>) => {
      const mapLayers = JSON.parse(JSON.stringify(state.mapLayers))

      const index = _findIndex(mapLayers, {
        layer_id: action.payload.layer_id
      })

      if (mapLayers) {
        const layer = mapLayers[index]
        let active = MapStyles.settings.get(layer.style, 'active')

        if (active) {
          layer.style = MapStyles.settings.set(layer.style, 'active', false)
          active = false
        } else {
          layer.style = MapStyles.settings.set(layer.style, 'active', true)
          active = true
        }

        if (layer.style?.layers) {
          for (const styleLayer of layer.style.layers) {
            if (!styleLayer.layout) {
              styleLayer.layout = {}
            }

            styleLayer.layout.visibility = active ? 'visible' : 'none'
          }
        }
        layer.style = MapStyles.settings.set(layer.style, 'active', true)
        layer.mapLayers = mapLayers
      }
    },

    updateLayerStyle: (
      state,
      action: PayloadAction<{
        layer_id: number
        style: mapboxgl.Style
        labels: Record<string, any>
        legend: string
      }>
    ) => {
      const { legend, layer_id } = action.payload
      // treat as immutable and clone
      const style = JSON.parse(JSON.stringify(action.payload.style))
      const labels = JSON.parse(JSON.stringify(action.payload.labels))
      const layers = JSON.parse(JSON.stringify(state.mapLayers))

      const index = _findIndex(layers, {
        layer_id
      })

      if (layers) {
        layers[index].style = style
        layers[index].labels = labels
        layers[index].legend_html = legend
        state.mapStyle = MapStyles.style.buildMapStyle(layers)
        state.mapLayers = layers
      }
    },

    saveMap: (
      state,
      action: PayloadAction<{
        title: LocalizedString
        position: MapPosition
      }>
    ) => {
      const { title, position } = action.payload
      state.title = title
      state.position = position
    },

    createMap: (
      state,
      action: PayloadAction<{
        map_id: number
        group_id: Group['group_id']
        title: LocalizedString
        position: MapPosition
      }>
    ) => {
      const { title, position, map_id, group_id } = action.payload
      state.title = title
      state.position = position
      state.map_id = map_id
      state.owned_by_group_id = group_id
    }
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    return
  }
})

export const {
  initMapMaker,
  reset,
  setMapLayers,
  setMapPosition,
  setSettings,
  addToMap,
  removeFromMap,
  toggleVisibility,
  updateLayerStyle,
  createMap,
  saveMap
} = mapMakerSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const selectLocale = (state: AppState): string => state.locale.value

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export default mapMakerSlice.reducer
