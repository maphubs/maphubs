import React from 'react'
import { Modal, message, notification } from 'antd'
import MapToolButton from '../Map/MapToolButton'
import useMapT from '../hooks/useMapT'
import { useSelector, useDispatch } from '../redux/hooks'
import {
  undoEdit,
  redoEdit,
  stopEditing,
  saveEdits
} from '../redux/reducers/dataEditorSlice'

const { confirm } = Modal
type Props = {
  stopEditingLayer: () => void
  onFeatureUpdate: (...args: Array<any>) => void
}

const EditorToolButtons = ({
  stopEditingLayer,
  onFeatureUpdate
}: Props): JSX.Element => {
  const { t } = useMapT()
  const dispatch = useDispatch()

  const edits = useSelector((state) => state.dataEditor.edits)

  const redo = useSelector((state) => state.dataEditor.redo)

  const onSaveEdits = async () => {
    const closeMessage = message.loading(t('Saving'), 0)
    try {
      await dispatch(saveEdits(true)).unwrap()
      message.success(t('Edits Saved'))
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    } finally {
      closeMessage()
    }
  }

  const onStopEditing = (): void => {
    if (edits.length > 0) {
      confirm({
        title: t('Unsaved Edits'),
        content: t('Do you want to save your edits before exiting?'),
        okText: t('Save Edits'),
        okType: 'primary',
        cancelText: t('Discard Edits'),

        async onOk() {
          await onSaveEdits()
          dispatch(stopEditing())
          stopEditingLayer()
        },

        onCancel() {
          dispatch(stopEditing())
          stopEditingLayer()
        }
      })
    } else {
      dispatch(stopEditing())
      stopEditingLayer()
    }
  }

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
          dispatch(undoEdit({ onFeatureUpdate }))
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
          dispatch(redoEdit({ onFeatureUpdate }))
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
        onClick={onSaveEdits}
        tooltipText={t('Save Edits')}
        tooltipPosition='left'
      />
      <MapToolButton
        top='265px'
        right='10px'
        icon='close'
        show
        color='#000'
        onClick={onStopEditing}
        tooltipText={t('Stop Editing')}
        tooltipPosition='left'
      />
    </div>
  )
}
export default EditorToolButtons
