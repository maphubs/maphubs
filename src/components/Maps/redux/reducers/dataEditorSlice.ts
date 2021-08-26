import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Layer } from '../../../../types/layer'
import Debug from '../../lib/debug'
import type { AppState } from '../store'
import { Feature } from 'geojson'
import _assignIn from 'lodash.assignin'
import _forEachRight from 'lodash.foreachright'

const debug = Debug('DataEditorReducer')

export interface Edit {
  status: 'create' | 'original' | 'modify'
  geojson: Feature & { id: string }
}

export interface DataEditorState {
  editing?: boolean
  editingLayer?: Layer
  originals: Edit[]
  // store the orginal GeoJSON to support undo
  edits: Edit[]
  redo: Edit[]
  // if we undo edits, add them here so we can redo them
  selectedEditFeature?: Edit // selected feature
  clickedFeature?: Feature // feature passed from mapbox-gl click handler
}

const initialState: DataEditorState = {
  editing: false,
  originals: [],
  // store the orginal GeoJSON to support undo
  edits: [],
  redo: [] // if we undo edits, add them here so we can redo them
}

const getLastEditForID = (
  state: DataEditorState,
  id: string,
  edits: Edit[]
): Edit | null => {
  const matchingEdits = []

  _forEachRight(edits, (edit) => {
    if (edit.geojson.id === id) {
      matchingEdits.push(edit)
    }
  })

  if (matchingEdits.length > 0) {
    return JSON.parse(JSON.stringify(matchingEdits[0]))
  } else {
    let original
    for (const orig of state.originals) {
      if (orig.geojson.id === id) {
        original = orig
      }
    }

    if (original) {
      return JSON.parse(JSON.stringify(original))
    }

    return null
  }
}

const selectFeatureThunk = createAsyncThunk(
  'dataEditor/selectFeature',
  async (
    mhid: string,
    { getState }
  ): Promise<{
    originals?: DataEditorState['originals']
    selectedEditFeature: DataEditorState['selectedEditFeature']
  }> => {
    const appState = getState() as AppState
    const state = appState.dataEditor

    // check if this feature is in the created or modified lists
    const selected = getLastEditForID(
      state as DataEditorState,
      mhid,
      state.edits
    )

    if (selected) {
      state.selectedEditFeature = selected
      return {
        selectedEditFeature: selected
      }
    } else {
      const id = mhid.split(':')[1]
      const layer_id: number =
        state.editingLayer && state.editingLayer.layer_id
          ? state.editingLayer.layer_id
          : 0

      // otherwise get the geojson from the server
      try {
        const res = await fetch(
          `/api/feature/json/${layer_id.toString()}/${id}/data.geojson`
        )
        const featureCollection = await res.json()
        const feature = featureCollection.features[0]
        const selected = {
          status: 'original' as Edit['status'],
          geojson: feature
        }
        selected.geojson.id = mhid
        const original = JSON.parse(JSON.stringify(selected)) // needs to be a clone

        return {
          originals: [...state.originals, original],
          selectedEditFeature: selected
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
)

const getUniqueFeatureIds = (state: DataEditorState): string[] => {
  const uniqueIds = []
  for (const edit of state.edits) {
    const id = edit.geojson.id

    if (id && !uniqueIds.includes(id)) {
      uniqueIds.push(id)
    }
  }
  return uniqueIds
}

const getAllEditsForFeatureId = (
  state: DataEditorState,
  id: string
): Edit[] => {
  const featureEdits = []
  for (const edit of state.edits) {
    if (edit.geojson.id === id) {
      featureEdits.push(edit)
    }
  }
  return featureEdits
}

/**
 * Save all edits to the server and reset current edits
 */
const saveEdits = createAsyncThunk(
  'dataEditor/saveEdits',
  async (_: unknown, { getState }): Promise<any> => {
    const appState = getState() as AppState
    const state = appState.dataEditor
    console.log('saving edits')
    //console.log(this.state.edits)
    const { editingLayer } = state

    const featureIds = getUniqueFeatureIds(state)
    const editsToSave = []
    for (const id of featureIds) {
      const featureEdits = getAllEditsForFeatureId(state, id)

      const lastFeatureEdit = featureEdits[featureEdits.length - 1]

      if (featureEdits.length > 1 && featureEdits[0].status === 'create') {
        // first edit is a create, so mark edit as create
        lastFeatureEdit.status = 'create'
      }

      editsToSave.push(lastFeatureEdit)
    }
    const layer_id: number = editingLayer?.layer_id || 0

    if (editsToSave.length > 0) {
      // send edits to server
      await fetch('/api/edits/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          layer_id,
          edits: editsToSave
        })
      })
      // const result = await response.json()
      return true
    } else {
      throw new Error('No pending edits found')
    }
  }
)

export const dataEditorSlice = createSlice({
  name: 'dataEditor',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    reset: (state) => {
      state.editing = false
      state.originals = []
      state.edits = []
      state.redo = []
    },

    startEditing: (
      state,
      action: PayloadAction<{ layer: DataEditorState['editingLayer'] }>
    ) => {
      state.editing = true
      state.editingLayer = action.payload.layer
    },

    stopEditing: (state, action: PayloadAction<{ layer: Layer }>) => {
      if (state.edits.length > 0) {
        debug.log('stopping with unsaved edits, edits have been deleted')
      }

      ;(state.editing = false),
        (state.originals = []),
        (state.edits = []),
        (state.redo = []),
        (state.editingLayer = undefined)
    },

    /**
     * receive updates from the drawing tool
     */
    updateFeatures: (state, action: PayloadAction<{ features: Feature[] }>) => {
      const { edits, selectedEditFeature } = state

      const editsClone = JSON.parse(JSON.stringify(edits))
      let selectedEditFeatureUpdate = selectedEditFeature
      for (const feature of action.payload.features) {
        debug.log('Updating feature: ' + feature.id)
        const edit = {
          status: 'modify' as Edit['status'],
          geojson: JSON.parse(JSON.stringify(feature))
        }

        if (
          selectedEditFeature &&
          feature.id === selectedEditFeature.geojson.id
        ) {
          // if popping an edit to the selected feature, updated it
          selectedEditFeatureUpdate = edit
        }

        // edit history gets a different clone from the selection state
        const editCopy = JSON.parse(JSON.stringify(edit))
        editsClone.push(editCopy)
      }

      ;(state.edits = editsClone),
        (state.selectedEditFeature = selectedEditFeatureUpdate),
        (state.redo = []) // redo resets if user makes an edit
    },

    resetEdits: (state) => {
      state.edits = []
      state.redo = []
    },

    undoEdit: (
      state,
      action: PayloadAction<{
        onFeatureUpdate: (type: string, edit: Edit) => void
      }>
    ) => {
      const edits = JSON.parse(JSON.stringify(state.edits))
      const redo = JSON.parse(JSON.stringify(state.redo))
      let selectedEditFeature = JSON.parse(
        JSON.stringify(state.selectedEditFeature)
      )

      if (edits.length > 0) {
        const lastEdit = edits.pop()
        const lastEditCopy = JSON.parse(JSON.stringify(lastEdit))
        redo.push(lastEditCopy)
        const currEdit = getLastEditForID(
          state as DataEditorState,
          lastEdit.geojson.id,
          edits
        )

        if (
          currEdit &&
          selectedEditFeature &&
          lastEdit.geojson.id === selectedEditFeature.geojson.id
        ) {
          // if popping an edit to the selected feature, updated it
          selectedEditFeature = currEdit
        }

        if (lastEdit.status === 'create') {
          // tell mapboxGL to delete the feature
          action.payload.onFeatureUpdate('delete', lastEdit)
        } else {
          // tell mapboxGL to update
          action.payload.onFeatureUpdate('update', currEdit)
        }
        state.edits = edits
        ;(state.redo = redo), (state.selectedEditFeature = selectedEditFeature)
      }
    },

    redoEdit: (
      state,
      action: PayloadAction<{
        onFeatureUpdate: (type: string, edit: Edit) => void
      }>
    ) => {
      const edits = JSON.parse(JSON.stringify(state.edits))
      const redo = JSON.parse(JSON.stringify(state.redo))
      let selectedEditFeature = JSON.parse(
        JSON.stringify(state.selectedEditFeature)
      )

      if (redo.length > 0) {
        const prevEdit = redo.pop()
        const prevEditCopy = JSON.parse(JSON.stringify(prevEdit))
        const prevEditCopy2 = JSON.parse(JSON.stringify(prevEdit))
        edits.push(prevEditCopy)

        if (
          selectedEditFeature &&
          prevEdit.geojson.id === selectedEditFeature.geojson.id
        ) {
          // if popping an edit to the selected feature, updated it
          selectedEditFeature = prevEditCopy2
        }

        // tell mapboxGL to update
        action.payload.onFeatureUpdate('update', prevEdit)

        state.edits = edits
        state.redo = redo
        state.selectedEditFeature = selectedEditFeature
      }
    },

    updateSelectedFeatureTags: (
      state,
      action: PayloadAction<{
        data: Record<string, unknown>
      }>
    ) => {
      const edits = JSON.parse(JSON.stringify(state.edits))

      if (state.selectedEditFeature) {
        console.log('updatings tags for selected feature')
        console.log(state.selectedEditFeature)
        // console.log(data)
        const selectedEditFeature = JSON.parse(
          JSON.stringify(state.selectedEditFeature)
        )
        // check if selected feature has been edited yet
        const editRecord = {
          status: 'modify',
          geojson: JSON.parse(JSON.stringify(selectedEditFeature.geojson))
        }

        // update the edit record
        _assignIn(editRecord.geojson.properties, action.payload.data)

        const editRecordCopy = JSON.parse(JSON.stringify(editRecord))
        edits.push(editRecordCopy)
        console.log('adding new edit record')
        console.log(editRecordCopy)

        state.edits = edits
        ;(state.redo = []), (state.selectedEditFeature = selectedEditFeature)
      } else {
        console.error('no feature selected')
      }
    },

    /**
     * Called when mapbox-gl-draw is used to create new feature
     *
     */
    createFeature: (
      state,
      action: PayloadAction<{
        feature: Feature
      }>
    ) => {
      const edits = JSON.parse(JSON.stringify(state.edits))
      const created = {
        status: 'create' as Edit['status'],
        geojson: JSON.parse(
          JSON.stringify(action.payload.feature)
        ) as Feature & { id: string }
      }
      edits.push(created)
      ;(state.edits = edits), (state.selectedEditFeature = created)
    },

    deleteFeature: (
      state,
      action: PayloadAction<{
        feature: Feature
      }>
    ) => {
      const edits = JSON.parse(JSON.stringify(state.edits))
      const edit = {
        status: 'delete',
        geojson: JSON.parse(JSON.stringify(action.payload.feature))
      }
      edits.push(edit)
      state.redo = []
      state.edits = edits
    },
    setClickedFeature: (
      state,
      action: PayloadAction<{
        feature: Feature
      }>
    ) => {
      state.clickedFeature = action.payload.feature
    }
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder.addCase(
      selectFeatureThunk.fulfilled,
      (
        state,
        action: PayloadAction<{
          originals?: DataEditorState['originals']
          selectedEditFeature: DataEditorState['selectedEditFeature']
        }>
      ) => {
        const { originals, selectedEditFeature } = action.payload
        if (originals) {
          state.originals = originals
        }
        state.selectedEditFeature = selectedEditFeature
      }
    )
    builder.addCase(saveEdits.fulfilled, (state) => {
      ;(state.originals = []),
        (state.edits = []),
        (state.redo = []),
        (state.selectedEditFeature = undefined)
    })
  }
})

export const {
  reset,
  startEditing,
  stopEditing,
  undoEdit,
  redoEdit,
  resetEdits,
  updateSelectedFeatureTags,
  createFeature,
  deleteFeature,
  updateFeatures,
  setClickedFeature
} = dataEditorSlice.actions

// export the thunks
export { selectFeatureThunk, saveEdits }

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
//export const selectLocale = (state: AppState): string => state.locale.value

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export default dataEditorSlice.reducer
