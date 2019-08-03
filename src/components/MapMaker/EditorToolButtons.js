// @flow
import React from 'react'
import { Subscribe } from 'unstated'
import { message, notification } from 'antd'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapToolButton from '../Map/MapToolButton'
import ConfirmationActions from '../../actions/ConfirmationActions'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {
  stopEditingLayer: Function,
  onFeatureUpdate: Function
}

type State = {} & LocaleStoreState

export default class EditorToolButtons extends MapHubsComponent<Props, State> {
  props: Props

 state: State = {
   edits: [],
   redo: [],
   originals: []
 }

  saveEdits = async (DataEditor: Object) => {
    const {t} = this
    const closeMessage = message.loading(t('Saving'), 0)
    await DataEditor.saveEdits(this.state._csrf, (err) => {
      closeMessage()
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Edits Saved'))
      }
    })
  }

  stopEditing = (DataEditor: Object) => {
    const {t, saveEdits} = this
    const {stopEditingLayer} = this.props
    if (DataEditor.state.edits.length > 0) {
      ConfirmationActions.showConfirmation({
        title: t('Unsaved Edits'),
        message: t('Do you want to save your edits before exiting?'),
        postitiveButtonText: t('Save Edits'),
        negativeButtonText: t('Discard Edits'),
        onPositiveResponse () {
          saveEdits(DataEditor)
          DataEditor.stopEditing()
          stopEditingLayer()
        },
        onNegativeResponse () {
          DataEditor.stopEditing()
          stopEditingLayer()
        }
      })
    } else {
      DataEditor.stopEditing()
      stopEditingLayer()
    }
  }

  undoEdit = (DataEditor: Object) => {
    const {onFeatureUpdate} = this.props
    DataEditor.undoEdit(onFeatureUpdate)
  }

  redoEdit = (DataEditor: Object) => {
    const {onFeatureUpdate} = this.props
    DataEditor.redoEdit(onFeatureUpdate)
  }

  render () {
    const {undoEdit, redoEdit, saveEdits, stopEditing, t} = this
    return (
      <Subscribe to={[DataEditorContainer]}>
        {DataEditor => {
          const {edits, redo} = DataEditor.state
          return (
            <div>
              <MapToolButton top='10px' right='125px' icon='undo' show color='#000'
                disabled={edits.length === 0}
                onClick={() => { undoEdit(DataEditor) }} tooltipText={t('Undo')} />
              <MapToolButton top='10px' right='90px' icon='redo' show color='#000'
                disabled={redo.length === 0}
                onClick={() => { redoEdit(DataEditor) }} tooltipText={t('Redo')} />
              <MapToolButton top='230px' right='10px' icon='save' show color='#000'
                disabled={edits.length === 0}
                onClick={() => { saveEdits(DataEditor) }} tooltipText={t('Save Edits')} />
              <MapToolButton top='265px' right='10px' icon='close' show color='#000'
                onClick={() => { stopEditing(DataEditor) }} tooltipText={t('Stop Editing')} />
            </div>
          )
        }}
      </Subscribe>
    )
  }
}
