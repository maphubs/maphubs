import React from 'react'
import LayerSettings from './LayerSettings'
import LayerActions from '../../actions/LayerActions'
import { notification, message, Row } from 'antd'
import { Group } from '../../types/group'
import useT from '../../hooks/useT'

const Step2 = ({
  groups,
  onSubmit
}: {
  groups: Group[]
  onSubmit: () => void
}): JSX.Element => {
  const { t } = useT()

  const submit = () => {
    if (!this.state.is_external && !this.state.is_empty) {
      return saveDataLoad()
    } else if (this.state.is_empty) {
      return initEmptyLayer()
    } else {
      return saveExternal()
    }
  }
  const initEmptyLayer = (): void => {
    // save presets
    LayerActions.loadDefaultPresets()
    LayerActions.submitPresets(true, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        LayerActions.initEmptyLayer((err) => {
          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            LayerActions.tileServiceInitialized()

            if (onSubmit) onSubmit()
          }
        })
      }
    })
  }
  const saveDataLoad = (): void => {
    const closeMessage = message.loading(t('Saving'), 0)
    // save presets
    LayerActions.submitPresets(false, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
        closeMessage()
      } else {
        LayerActions.loadData((err) => {
          closeMessage()

          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            LayerActions.tileServiceInitialized()

            if (onSubmit) onSubmit()
          }
        })
      }
    })
  }
  const saveExternal = (): void => {
    LayerActions.tileServiceInitialized()

    if (onSubmit) {
      onSubmit()
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
