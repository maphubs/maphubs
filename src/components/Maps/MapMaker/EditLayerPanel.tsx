import React from 'react'
import DataCollectionForm from '../DataCollection/DataCollectionForm'
import _isequal from 'lodash.isequal'
import { Subscribe } from 'unstated'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapStyles from '../Map/Styles'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { LocalizedString } from '../../types/LocalizedString'
const debug = DebugService('editLayerPanel')

const onChange = (
  data: Record<string, any>,
  DataEditor: Record<string, any>
) => {
  // don't fire change if this update came from state (e.g. undo/redo)
  // the geojson may have tags not in the presets so we need to ignore them when checking for changes
  let foundChange
  const { selectedEditFeature } = DataEditor.state

  if (selectedEditFeature && selectedEditFeature.geojson) {
    const properties = selectedEditFeature.geojson.properties
    for (const key of Object.keys(data)) {
      if (!_isequal(data[key], properties[key])) {
        foundChange = true
      }
    }

    if (foundChange) {
      DataEditor.updateSelectedFeatureTags(data)
    }
  } else {
    debug.log('missing geoJSON')
  }
}

type Props = {
  t: (v: string | LocalizedString) => string
}
const EditLayerPanel = ({ t }: Props): JSX.Element => {
  return (
    <Subscribe to={[DataEditorContainer]}>
      {(DataEditor) => {
        const { selectedEditFeature, editingLayer } = DataEditor.state

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
                  onChange(data, DataEditor)
                }}
                style={{
                  padding: '10px',
                  height: '100%',
                  overflow: 'auto'
                }}
                showSubmit={false}
              />
            )}
          </div>
        )
      }}
    </Subscribe>
  )
}
export default EditLayerPanel
