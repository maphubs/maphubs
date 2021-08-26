import React from 'react'
import LayerSettings from './LayerSettings'
import { notification, message, Row } from 'antd'
import { Group } from '../../types/group'
import useT from '../../hooks/useT'
import LayerAPI from '../../redux/reducers/layer-api'

import { useDispatch, useSelector } from '../../redux/hooks'
import {
  tileServiceInitialized,
  loadDefaultPresets,
  submitPresets,
  LayerState
} from '../../redux/reducers/layerSlice'

const Step2 = ({
  groups,
  onSubmit
}: {
  groups: Group[]
  onSubmit: () => void
}): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)
  const style = useSelector((state) => state.layer.style)
  const presets = useSelector((state) => state.layer.presets)
  const is_external = useSelector((state) => state.layer.is_external)
  const is_empty = useSelector((state) => state.layer.is_empty)

  const submit = () => {
    if (!is_external && !is_empty) {
      return saveDataLoad()
    } else if (is_empty) {
      return saveEmptyLayer()
    } else {
      dispatch(tileServiceInitialized())
      if (onSubmit) onSubmit()
    }
  }
  const saveEmptyLayer = async () => {
    // save presets
    dispatch(loadDefaultPresets())

    try {
      const presetsUpdate = await LayerAPI.submitPresets(
        presets,
        style,
        layer_id,
        true
      )
      dispatch(submitPresets(presetsUpdate))
      await LayerAPI.initEmptyLayer(layer_id)
      dispatch(tileServiceInitialized())
      if (onSubmit) onSubmit()
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }
  const saveDataLoad = async () => {
    const closeMessage = message.loading(t('Saving'), 0)
    // save presets
    try {
      const presetsUpdate = await LayerAPI.submitPresets(
        presets,
        style,
        layer_id,
        false
      )
      dispatch(submitPresets(presetsUpdate))
      await LayerAPI.loadData(layer_id)
      dispatch(tileServiceInitialized())
      if (onSubmit) onSubmit()
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    } finally {
      closeMessage()
    }
  }

  return (
    <Row>
      <p>{t('Provide Information About the Data Layer')}</p>
      <LayerSettings
        groups={groups}
        submitText={t('Save and Continue')}
        onSubmit={submit}
        warnIfUnsaved={false}
      />
    </Row>
  )
}
export default Step2
