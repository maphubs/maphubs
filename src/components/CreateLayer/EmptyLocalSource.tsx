import React from 'react'
import { Row, Col, message, notification, Button } from 'antd'
import useT from '../../hooks/useT'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import { saveDataSettings } from '../../redux/reducers/layerSlice'

type Props = {
  onSubmit: () => void
  type: string
}
const EmptyLocalSource = ({ type, onSubmit }: Props): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()

  const layer_id = useSelector((state) => state.layer.layer_id)

  return (
    <Row
      justify='end'
      style={{
        marginBottom: '20px'
      }}
    >
      <Col sm={24} md={12}>
        <p>{t('Creating a new layer of type:') + ' ' + type}</p>
      </Col>
      <Col
        sm={24}
        md={12}
        style={{
          textAlign: 'right'
        }}
      >
        <Button
          type='primary'
          onClick={async () => {
            const dataSettings = {
              is_external: false,
              external_layer_type: '',
              external_layer_config: {},
              is_empty: true,
              empty_data_type: type
            }
            try {
              await LayerAPI.saveDataSettings(layer_id, dataSettings)
              dispatch(saveDataSettings(dataSettings))
              message.success(t('Layer Saved'), 1, onSubmit)
            } catch (err) {
              notification.error({
                message: t('Server Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            }
          }}
        >
          {t('Save and Continue')}
        </Button>
      </Col>
    </Row>
  )
}
export default EmptyLocalSource
