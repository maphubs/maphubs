import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import _findIndex from 'lodash.findindex'
import _remove from 'lodash.remove'
import _differenceBy from 'lodash.differenceby'
import MapStyles from '../../components/Maps/Map/Styles'

import type { MapHubsField } from '../../types/maphubs-field'
import localeUtil from '../../locales/util'

import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Layer } from '../../types/layer'
import mapboxgl from 'mapbox-gl'

const debug = DebugService('layer-slice')

export type LayerState = {
  // other status
  status?: string
  tileServiceInitialized?: boolean
  pendingChanges?: boolean
  // presets
  presets: MapHubsField[]
  pendingPresetChanges: boolean
  presetIDSequence: number
} & Layer

const initialState: LayerState = {
  layer_id: -1,
  shortid: '',
  owned_by_group_id: null,
  last_updated: null,
  creation_time: null,
  name: localeUtil.getEmptyLocalizedString(),
  description: localeUtil.getEmptyLocalizedString(),
  published: true,
  data_type: '',
  source: localeUtil.getEmptyLocalizedString(),
  license: 'none',
  preview_position: {
    zoom: 1,
    lat: 0,
    lng: 0,
    bbox: [
      [-180, -180],
      [180, 180]
    ]
  },
  style: null,
  legend_html: null,
  is_external: false,
  external_layer_type: '',
  external_layer_config: {},
  complete: false,
  private: false,
  disable_export: false,
  allow_public_submit: false,
  // status flags
  tileServiceInitialized: false,
  pendingChanges: false,
  // presets
  presets: [],
  pendingPresetChanges: false,
  presetIDSequence: 1
}

const move = (array: MapHubsField[], fromIndex: number, toIndex: number) => {
  array.splice(toIndex, 0, array.splice(fromIndex, 1)[0])
  return array
}

const updatePresetsInStyle = (style, presets: MapHubsField[]) => {
  style = JSON.parse(JSON.stringify(style))

  if (style) {
    for (const key of Object.keys(style.sources)) {
      // our layers normally only have one source, but just in case...
      style = MapStyles.settings.setSourceSetting(
        style,
        key,
        'presets',
        presets
      )
    }
    return style
  } else {
    debug.log('Missing style')
  }
}

const getSourceConfig = (state: LayerState) => {
  let sourceConfig: Layer['external_layer_config'] = {
    type: 'vector'
  }

  if (state.is_external) {
    sourceConfig = state.external_layer_config
  }

  return sourceConfig
}

const resetStyleGL = (state: LayerState) => {
  let style = state.style
    ? JSON.parse(JSON.stringify(state.style))
    : {
        sources: {}
      }
  const layer_id = state.layer_id ? state.layer_id : -1
  const isExternal = state.is_external
  const shortid = state.shortid
  const elc = state.external_layer_config

  if (isExternal && state.external_layer_type === 'mapbox-map' && elc.url) {
    style = MapStyles.raster.rasterStyleTileJSON(
      layer_id,
      shortid,
      elc.url,
      100,
      'raster'
    )
  } else if (
    isExternal &&
    (elc.type === 'raster' ||
      elc.type === 'earthengine' ||
      elc.type === 'ags-mapserver-tiles')
  ) {
    style = MapStyles.raster.defaultRasterStyle(
      layer_id,
      shortid,
      elc,
      elc.type
    )
  } else if (isExternal && elc.type === 'multiraster' && elc.layers) {
    style = MapStyles.raster.defaultMultiRasterStyle(
      layer_id,
      shortid,
      elc.layers,
      'raster',
      elc
    )
  } else if (isExternal && elc.type === 'mapbox-style' && elc.mapboxid) {
    style = MapStyles.style.getMapboxStyle(elc.mapboxid)
  } else if (isExternal && elc.type === 'geojson' && elc.data_type) {
    style = MapStyles.style.defaultStyle(
      layer_id,
      shortid,
      getSourceConfig(state),
      elc.data_type
    )
  } else if (style.sources.osm) {
    alert('Unable to reset OSM layers')
    return
  } else {
    style = MapStyles.style.defaultStyle(
      layer_id,
      shortid,
      getSourceConfig(state),
      state.data_type
    )
  }

  // restore presets
  const presets = state.presets
  for (const sourceID of Object.keys(style.sources)) {
    const mapSource = style.sources[sourceID]

    if (!mapSource.metadata) {
      mapSource.metadata = {}
    }

    mapSource.metadata['maphubs:presets'] = presets
  }
  return style
}

const resetLegendHTML = (state: LayerState) => {
  let legend_html
  const { is_external, external_layer_config } = state
  const elc = external_layer_config

  if (
    is_external &&
    (elc.type === 'raster' ||
      elc.type === 'earthengine' ||
      elc.type === 'multiraster' ||
      elc.type === 'ags-mapserver-tiles')
  ) {
    legend_html = MapStyles.legend.rasterLegend()
  } else if (is_external && elc.type === 'mapbox-style') {
    legend_html = MapStyles.legend.rasterLegend()
  } else {
    legend_html = MapStyles.legend.defaultLegend(state)
  }

  return legend_html
}

const initLayer = (state: LayerState) => {
  // treat as immutable and clone

  if (!state.style) {
    state.style = MapStyles.style.defaultStyle(
      state.layer_id,
      state.shortid,
      getSourceConfig(state),
      state.data_type
    )
  }

  state.legend_html = !state.legend_html
    ? MapStyles.legend.defaultLegend(state)
    : resetLegendHTML(state)

  if (!state.preview_position) {
    state.preview_position = {
      zoom: 1,
      lat: 0,
      lng: 0,
      bbox: null
    }
  }
}

export const layerSlice = createSlice({
  name: 'layer',
  initialState,
  reducers: {
    loadLayer: (state, action: PayloadAction<Layer>) => {
      for (const key of Object.keys(action.payload)) {
        state[key] = action.payload[key]
      }

      let style = state.style

      if (!style) {
        style = resetStyleGL(state as LayerState)
        state.style = style
      }

      if (!state.legend_html) {
        state.legend_html = resetLegendHTML(state as LayerState)
      }

      if (style) {
        const firstSource = Object.keys(style.sources)[0]
        const presets = MapStyles.settings.getSourceSetting(
          style as mapboxgl.Style,
          firstSource,
          'presets'
        )

        if (presets && Array.isArray(presets)) {
          for (const preset of presets) {
            if (state.presetIDSequence) {
              preset.id = state.presetIDSequence++
            }
          }
          state.style = updatePresetsInStyle(style, presets)
          state.presets = presets
        }
      } else {
        debug.log('Missing style')
      }
    },
    saveSettings: (
      state,
      action: PayloadAction<{
        name: LayerState['name']
        description: LayerState['description']
        group: LayerState['owned_by_group_id']
        private: LayerState['private']
        source: LayerState['source']
        license: LayerState['license']
      }>
    ) => {
      const data = action.payload

      state.name = data.name
      state.description = data.description
      state.owned_by_group_id = data.group
      state.private = data.private
      state.source = data.source
      state.license = data.license
    },
    saveAdminSettings: (
      state,
      action: PayloadAction<{
        group: LayerState['owned_by_group_id']
        disableExport: LayerState['disable_export']
        allowPublicSubmit: LayerState['allow_public_submit']
      }>
    ) => {
      const data = action.payload
      state.owned_by_group_id = data.group
      state.disable_export = data.disableExport
      state.allow_public_submit = data.allowPublicSubmit
    },
    saveExternalLayerConfig: (
      state,
      action: PayloadAction<Layer['external_layer_config']>
    ) => {
      state.external_layer_config = action.payload
    },
    saveDataSettings: (
      state,
      action: PayloadAction<{
        is_empty?: boolean
        empty_data_type?: string
        is_external: boolean
        external_layer_type: Layer['external_layer_type']
        external_layer_config: Layer['external_layer_config']
      }>
    ) => {
      const data = action.payload
      if (data.is_empty) {
        state.data_type = data.empty_data_type
      }

      state.is_external = data.is_external
      state.external_layer_type = data.external_layer_type
      state.external_layer_config = data.external_layer_config
      state.is_empty = data.is_empty
    },

    setStyle: (
      state,
      action: PayloadAction<{
        style?: LayerState['style']
        labels?: LayerState['labels']
        legend_html?: string
        preview_position?: LayerState['preview_position']
      }>
    ) => {
      // treat as immutable and clone
      const data = action.payload
      state.style = data.style
        ? JSON.parse(JSON.stringify(data.style))
        : state.style
      state.labels = data.labels
        ? JSON.parse(JSON.stringify(data.labels))
        : state.labels
      state.legend_html = data.legend_html
        ? data.legend_html
        : state.legend_html
      state.preview_position = data.preview_position
        ? JSON.parse(JSON.stringify(data.preview_position))
        : state.preview_position
    },
    tileServiceInitialized: (state) => {
      state.tileServiceInitialized = true
    },
    setDataType: (state, action: PayloadAction<Layer['data_type']>) => {
      state.data_type = action.payload
    },
    resetStyle: (state) => {
      state.style = resetStyleGL(state as LayerState)
      state.legend_html = resetLegendHTML(state as LayerState)
    },
    setComplete: (state) => {
      state.complete = true
    },

    // presets
    setImportedTags: (
      state,
      action: PayloadAction<{ data: Record<string, any>; initLayer: boolean }>
    ) => {
      let { data } = action.payload
      debug.log('setImportedTags')
      // treat as immutable and clone
      data = JSON.parse(JSON.stringify(data))

      // convert tags to presets
      const presets = data.map((tag: string) => {
        let preset

        if (state.presetIDSequence) {
          preset =
            tag === 'mhid'
              ? {
                  tag: 'orig_mhid',
                  label: 'orig_mhid',
                  type: 'text',
                  isRequired: false,
                  showOnMap: true,
                  mapTo: tag,
                  id: state.presetIDSequence++
                }
              : {
                  tag,
                  label: tag,
                  type: 'text',
                  isRequired: false,
                  showOnMap: true,
                  mapTo: tag,
                  id: state.presetIDSequence++
                }
        }

        return preset
      })

      if (action.payload.initLayer) {
        initLayer(state as LayerState)
      }
      state.pendingPresetChanges = true

      state.style = updatePresetsInStyle(state.style, presets)
      state.presets = presets
    },
    submitPresets: (state, action: PayloadAction<LayerState['presets']>) => {
      // call after presets are saved to the server
      state.presets = action.payload
      state.pendingPresetChanges = false
    },
    addPreset: (state) => {
      debug.log('adding new preset')
      const presets: Array<MapHubsField> = JSON.parse(
        JSON.stringify(state.presets)
      )

      if (state.presetIDSequence) {
        presets.push({
          tag: '',
          label: '',
          type: 'text',
          isRequired: false,
          showOnMap: true,
          id: state.presetIDSequence++
        })
      }

      state.pendingPresetChanges = true
      state.style = updatePresetsInStyle(state.style, presets)
      state.presets = presets
    },
    deletePreset: (state, action: PayloadAction<number>) => {
      const id = action.payload
      if (state.presets) {
        const presets: Array<MapHubsField> = JSON.parse(
          JSON.stringify(state.presets)
        )
        debug.log('delete preset:' + id)

        _remove(presets, {
          id
        })

        state.pendingPresetChanges = true
        state.style = updatePresetsInStyle(state.style, presets)
        state.presets = presets
      }
    },

    updatePreset: (
      state,
      action: PayloadAction<{ id: number; preset: MapHubsField }>
    ) => {
      const { id, preset } = action.payload
      debug.log('update preset:' + id)

      if (state.presets) {
        const presets: Array<MapHubsField> = JSON.parse(
          JSON.stringify(state.presets)
        )

        const i = _findIndex(presets, {
          id
        })

        if (i >= 0) {
          presets[i] = preset
          state.pendingPresetChanges = true
          state.style = updatePresetsInStyle(state.style, presets)
          state.presets = presets
        }
      } else {
        debug.log("Can't find preset with id: " + id)
      }
    },

    movePresetUp: (state, action: PayloadAction<number>) => {
      const id = action.payload
      if (state.presets) {
        let presets: Array<MapHubsField> = JSON.parse(
          JSON.stringify(state.presets)
        )

        const index = _findIndex(presets, {
          id
        })

        if (index === 0) return
        presets = move(presets, index, index - 1)
        state.pendingPresetChanges = true
        state.style = updatePresetsInStyle(state.style, presets)
        state.presets = presets
      } else {
        debug.log('Missing presets')
      }
    },

    movePresetDown: (state, action: PayloadAction<number>) => {
      const id = action.payload
      if (state.presets) {
        let presets: Array<MapHubsField> = JSON.parse(
          JSON.stringify(state.presets)
        )

        const index = _findIndex(presets, {
          id
        })

        if (index === presets.length - 1) return
        presets = move(presets, index, index + 1)
        state.pendingPresetChanges = true
        state.style = updatePresetsInStyle(state.style, presets)
        state.presets = presets
      } else {
        debug.log('Missing presets')
      }
    },

    mergeNewPresetTags: (state, action: PayloadAction<string[]>) => {
      const data = action.payload
      if (state.presets) {
        let presets: Array<MapHubsField> = JSON.parse(
          JSON.stringify(state.presets)
        )
        let idSeq = presets.length - 1
        const importedPresets = data.map((tag: string) => {
          return {
            tag,
            label: tag,
            type: 'text',
            isRequired: false,
            showOnMap: true,
            mapTo: tag,
            id: idSeq++
          }
        })

        const newPresets = _differenceBy(importedPresets, presets, 'tag')

        presets = [...presets, ...newPresets]
        state.style = updatePresetsInStyle(state.style, presets)
        state.presets = presets
      }
    },

    loadDefaultPresets: (state) => {
      // called when setting up a new empty layer
      if (state.presetIDSequence) {
        const presets: MapHubsField[] = [
          {
            tag: 'name',
            label: 'Name',
            type: 'text',
            isRequired: true,
            showOnMap: true,
            id: state.presetIDSequence++
          },
          {
            tag: 'description',
            label: 'Description',
            type: 'text',
            isRequired: false,
            showOnMap: true,
            id: state.presetIDSequence++
          },
          {
            tag: 'source',
            label: 'Source',
            type: 'text',
            isRequired: true,
            showOnMap: true,
            id: state.presetIDSequence++
          }
        ]
        initLayer(state as LayerState)
        state.pendingPresetChanges = true

        state.style = updatePresetsInStyle(state.style, presets)
        state.presets = presets
      }
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    return
  }
})

export const {
  loadLayer,
  saveSettings,
  saveAdminSettings,
  saveExternalLayerConfig,
  saveDataSettings,
  mergeNewPresetTags,
  setStyle,
  tileServiceInitialized,
  setDataType,
  resetStyle,
  setComplete,
  setImportedTags,
  submitPresets,
  addPreset,
  deletePreset,
  updatePreset,
  movePresetUp,
  movePresetDown,
  loadDefaultPresets
} = layerSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSettings = (state: { layer: LayerState }) => {
  return {
    layer_id: state.layer.layer_id,
    owned_by_group_id: state.layer.owned_by_group_id,
    status: state.layer.status,
    license: state.layer.license,
    name: state.layer.name,
    description: state.layer.description,
    source: state.layer.source
  }
}
export const selectMapStyle = (state: { layer: LayerState }) => {
  return {
    style: state.layer.style,
    labels: state.layer.labels,
    legend_html: state.layer.legend_html,
    preview_position: state.layer.preview_position,
    presets: state.layer.presets
  }
}
// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export default layerSlice.reducer
