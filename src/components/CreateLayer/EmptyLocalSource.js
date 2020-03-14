// @flow
import React from 'react'
import { Row, Col, message, notification, Button } from 'antd'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'

import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {|
  onSubmit: Function,
  type: string
|}

export default class EmptyLocalSource extends MapHubsComponent<Props, LocaleStoreState> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  onSubmit = () => {
    const {t} = this
    const _this = this
    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {},
      is_empty: true,
      empty_data_type: this.props.type
    }

    LayerActions.saveDataSettings(data, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'), 1, _this.props.onSubmit)
      }
    })
  }

  render () {
    const {t} = this
    return (
      <Row justify='end' style={{marginBottom: '20px'}}>
        <Col sm={24} md={12}>
          <p>{t('Creating a new layer of type:') + ' ' + this.props.type}</p>
        </Col>
        <Col sm={24} md={12} style={{textAlign: 'right'}}>
          <Button type='primary' onClick={this.onSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</Button>
        </Col>
      </Row>
    )
  }
}
