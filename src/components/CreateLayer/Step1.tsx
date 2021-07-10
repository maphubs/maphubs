import React, { useState } from 'react'
import { message, notification, Row } from 'antd'
import LayerActions from '../../actions/LayerActions'
import CreateLayer from './CreateLayer'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import { LocaleState } from '../../redux/reducers/locale'

type Props = {
  onSubmit: () => void
  mapConfig: Record<string, any>
}

const Step1 = ({ onSubmit, mapConfig }: Props): JSX.Element => {
  const { t } = useT()
  const _csrf = useSelector(
    (state: { locale: LocaleState }) => state.locale._csrf
  )
  const [warnIfUnsaved, setWarnIfUnsaved] = useState(false)

  const onCancel = (): void => {
    // delete the layer
    LayerActions.cancelLayer(_csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setWarnIfUnsaved(false)
        message.info(t('Layer Cancelled'), 1, () => {
          window.location.assign('/layers')
        })
      }
    })
  }

  return (
    <Row>
      <CreateLayer
        onSubmit={onSubmit}
        mapConfig={mapConfig}
        showCancel
        cancelText={t('Cancel')}
        onCancel={onCancel}
      />
    </Row>
  )
}
export default Step1
