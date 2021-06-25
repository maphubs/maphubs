import React from 'react'
import { Subscribe } from 'unstated'
import { Modal, message, notification } from 'antd'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapToolButton from '../Map/MapToolButton'
import type { LocaleStoreState } from '../../stores/LocaleStore'
const { confirm } = Modal
type Props = {
  stopEditingLayer: (...args: Array<any>) => any
  onFeatureUpdate: (...args: Array<any>) => any
  t: (...args: Array<any>) => any
  _csrf: string
}
type State = {} & LocaleStoreState
export default class EditorToolButtons extends React.Component<Props, State> {
  saveEdits: (DataEditor: any) => Promise<void> = async (
    DataEditor: Record<string, any>
  ) => {
    const { t, _csrf } = this.props
    const closeMessage = message.loading(t('Saving'), 0)
    await DataEditor.saveEdits(_csrf, (err) => {
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
  stopEditing: (DataEditor: any) => void = (
    DataEditor: Record<string, any>
  ) => {
    const { saveEdits } = this
    const { stopEditingLayer, t } = this.props

    if (DataEditor.state.edits.length > 0) {
      confirm({
        title: t('Unsaved Edits'),
        content: t('Do you want to save your edits before exiting?'),
        okText: t('Save Edits'),
        okType: 'primary',
        cancelText: t('Discard Edits'),
        cancelType: 'danger',

        onOk() {
          saveEdits(DataEditor)
          DataEditor.stopEditing()
          stopEditingLayer()
        },

        onCancel() {
          DataEditor.stopEditing()
          stopEditingLayer()
        }
      })
    } else {
      DataEditor.stopEditing()
      stopEditingLayer()
    }
  }
  undoEdit: (DataEditor: any) => void = (DataEditor: Record<string, any>) => {
    const { onFeatureUpdate } = this.props
    DataEditor.undoEdit(onFeatureUpdate)
  }
  redoEdit: (DataEditor: any) => void = (DataEditor: Record<string, any>) => {
    const { onFeatureUpdate } = this.props
    DataEditor.redoEdit(onFeatureUpdate)
  }

  render(): JSX.Element {
    const { undoEdit, redoEdit, saveEdits, stopEditing } = this
    const { t } = this.props
    return (
      <Subscribe to={[DataEditorContainer]}>
        {(DataEditor) => {
          const { edits, redo } = DataEditor.state
          return (
            <div>
              <MapToolButton
                top='10px'
                right='125px'
                icon='undo'
                show
                color='#000'
                disabled={edits.length === 0}
                onClick={() => {
                  undoEdit(DataEditor)
                }}
                tooltipText={t('Undo')}
                tooltipPosition='left'
              />
              <MapToolButton
                top='10px'
                right='90px'
                icon='redo'
                show
                color='#000'
                disabled={redo.length === 0}
                onClick={() => {
                  redoEdit(DataEditor)
                }}
                tooltipText={t('Redo')}
                tooltipPosition='left'
              />
              <MapToolButton
                top='230px'
                right='10px'
                icon='save'
                show
                color='#000'
                disabled={edits.length === 0}
                onClick={() => {
                  saveEdits(DataEditor)
                }}
                tooltipText={t('Save Edits')}
                tooltipPosition='left'
              />
              <MapToolButton
                top='265px'
                right='10px'
                icon='close'
                show
                color='#000'
                onClick={() => {
                  stopEditing(DataEditor)
                }}
                tooltipText={t('Stop Editing')}
                tooltipPosition='left'
              />
            </div>
          )
        }}
      </Subscribe>
    )
  }
}
