import React from 'react'
import DataCollectionForm from '../DataCollection/DataCollectionForm'
import _isequal from 'lodash.isequal'
import MapStyles from '../Map/Styles'
import DebugService from '../lib/debug'
import { useSelector, useDispatch } from '../redux/hooks'
import { updateSelectedFeatureTags } from '../redux/reducers/dataEditorSlice'
import useMapT from '../hooks/useMapT'

const debug = DebugService('editLayerPanel')

const EditLayerPanel = (): JSX.Element => {
  const { t } = useMapT()
  const dispatch = useDispatch()
  const selectedEditFeature = useSelector(
    (state) => state.dataEditor.selectedEditFeature
  )
  const editingLayer = useSelector((state) => state.dataEditor.editingLayer)

  const onChange = (data: Record<string, unknown>) => {
    // don't fire change if this update came from state (e.g. undo/redo)
    // the geojson may have tags not in the presets so we need to ignore them when checking for changes
    let foundChange
    if (selectedEditFeature && selectedEditFeature.geojson) {
      const properties = selectedEditFeature.geojson.properties
      for (const key of Object.keys(data)) {
        if (!_isequal(data[key], properties[key])) {
          foundChange = true
        }
      }

      if (foundChange) {
        dispatch(updateSelectedFeatureTags({ data }))
      }
    } else {
      debug.log('missing geoJSON')
    }
  }

  return (
    <div
      style={{
        height: 'calc(100% - 75px'
      }}
    >
      {editingLayer && (
        <p
          className='word-wrap'
          style={{
            paddingTop: '2px',
            paddingLeft: '2px',
            paddingRight: '2px',
            paddingBottom: '5px'
          }}
        >
          <b>{t('Editing:')}</b> {t(editingLayer.name)}
        </p>
      )}
      {selectedEditFeature && editingLayer && editingLayer.style && (
        <DataCollectionForm
          presets={MapStyles.settings.getSourceSetting(
            editingLayer.style,
            Object.keys(editingLayer.style.sources)[0], //first source
            'presets'
          )}
          values={selectedEditFeature.geojson.properties}
          onChange={(data) => {
            onChange(data)
          }}
          style={{
            padding: '10px',
            height: '100%',
            overflow: 'auto'
          }}
          showSubmit={false}
          t={t}
        />
      )}
    </div>
  )
}
export default EditLayerPanel
