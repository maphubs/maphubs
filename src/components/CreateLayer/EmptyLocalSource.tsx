import React from 'react'
import { Row, Col, message, notification, Button } from 'antd'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
type Props = {
  onSubmit: () => void
  type: string
}
export default class EmptyLocalSource extends React.Component<
  Props,
  LocaleStoreState
> {
  props: Props

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  render(): JSX.Element {
    const { t, props, state } = this
    const { type, onSubmit } = props
    const { _csrf } = state
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
                _csrf,
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
}
