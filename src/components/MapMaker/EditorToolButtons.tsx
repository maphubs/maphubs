import React from 'react'
import { Subscribe } from 'unstated'
import { Modal, message, notification } from 'antd'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapToolButton from '../Map/MapToolButton'
import useT from '../../hooks/useT'

const { confirm } = Modal
type Props = {
  stopEditingLayer: () => void
  onFeatureUpdate: (...args: Array<any>) => void
}

const EditorToolButtons = ({
  stopEditingLayer,
  onFeatureUpdate
}: Props): JSX.Element => {
  const { t } = useT()

  const saveEdits = async (DataEditor: Record<string, any>): Promise<void> => {
    const closeMessage = message.loading(t('Saving'), 0)
    await DataEditor.saveEdits((err) => {
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
  const stopEditing = (DataEditor: Record<string, any>): void => {
    if (DataEditor.state.edits.length > 0) {
      confirm({
        title: t('Unsaved Edits'),
        content: t('Do you want to save your edits before exiting?'),
        okText: t('Save Edits'),
        okType: 'primary',
        cancelText: t('Discard Edits'),

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
  const undoEdit = (DataEditor: Record<string, any>) => {
    DataEditor.undoEdit(onFeatureUpdate)
  }
  const redoEdit = (DataEditor: Record<string, any>) => {
    DataEditor.redoEdit(onFeatureUpdate)
  }

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
export default EditorToolButtons
