import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { message, notification, Row } from 'antd'
import CreateLayer from './CreateLayer'
import useT from '../../hooks/useT'
import LayerAPI from '../../redux/reducers/layer-api'
import { useSelector } from '../../redux/hooks'

type Props = {
  onSubmit: () => void
  mapConfig: Record<string, any>
}

const Step1 = ({ onSubmit, mapConfig }: Props): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const layer_id = useSelector((state) => state.layer.layer_id)

  const [warnIfUnsaved, setWarnIfUnsaved] = useState(false)

  const onCancel = async () => {
    // delete the layer
    try {
      await LayerAPI.deleteLayer(layer_id)
      setWarnIfUnsaved(false)
      message.info(t('Layer Cancelled'), 1, () => {
        router.push('/layers')
      })
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
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
