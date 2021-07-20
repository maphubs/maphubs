import React from 'react'
import { Row, Col, message, notification, Button } from 'antd'
import LayerActions from '../../actions/LayerActions'
import useT from '../../hooks/useT'

type Props = {
  onSubmit: () => void
  type: string
}
const EmptyLocalSource = ({ type, onSubmit }: Props): JSX.Element => {
  const { t } = useT()

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
          onClick={() => {
            LayerActions.saveDataSettings(
              {
                is_external: false,
                external_layer_type: '',
                external_layer_config: {},
                is_empty: true,
                empty_data_type: type
              },
              (err) => {
                if (err) {
                  notification.error({
                    message: t('Server Error'),
                    description: err.message || err.toString() || err,
                    duration: 0
                  })
                } else {
                  message.success(t('Layer Saved'), 1, onSubmit)
                }
              }
            )
          }}
        >
          {t('Save and Continue')}
        </Button>
      </Col>
    </Row>
  )
}
export default EmptyLocalSource
