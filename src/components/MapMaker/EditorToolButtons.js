// @flow
import React from 'react'
import { Subscribe } from 'unstated'
import { message } from 'antd'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapToolButton from '../Map/MapToolButton'
import MessageActions from '../../actions/MessageActions'
import ConfirmationActions from '../../actions/ConfirmationActions'
import Progress from '../Progress'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {
  stopEditingLayer: Function,
  onFeatureUpdate: Function
}

type State = {
   saving: boolean
} & LocaleStoreState

export default class EditorToolButtons extends MapHubsComponent<Props, State> {
  props: Props

 state: State = {
   saving: false,
   edits: [],
   redo: [],
   originals: []
 }

  saveEdits = async (DataEditor: Object) => {
    const {t} = this
    const _this = this
    this.setState({saving: true})
    await DataEditor.saveEdits(this.state._csrf, (err) => {
      _this.setState({saving: false})
      if (err) {
        MessageActions.showMessage({title: t('Error'), message: err})
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
    const {saving} = this.state
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
              <Progress id='saving-edits' title={t('Saving')} subTitle='' dismissible={false} show={saving} />
            </div>
          )
        }}
      </Subscribe>
    )
  }
}
