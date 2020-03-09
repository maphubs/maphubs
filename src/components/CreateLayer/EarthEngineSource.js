// @flow
import React from 'react'
import Formsy from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import TextInput from '../forms/textInput'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'
import MapHubsComponent from '../MapHubsComponent'

import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'

type Props = {
  onSubmit: Function
}

type State = {
  canSubmit: boolean,
  selectedSource?: string
} & LocaleStoreState & LayerStoreState;

export default class EarthEngineSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  submit = (model: Object) => {
    const {t} = this
    const _this = this

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Earth Engine',
      external_layer_config: {
        type: 'earthengine',
        min: parseInt(model.min, 10),
        max: parseInt(model.max, 10),
        image_id: model.image_id
      }
    }, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'), 1, () => {
          LayerActions.resetStyle()
          // tell the map that the data is initialized
          LayerActions.tileServiceInitialized()
          _this.props.onSubmit()
        })
      }
    })
  }

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  render () {
    const {t} = this
    return (
      <Row style={{marginBottom: '20px'}}>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>{t('Earth Engine Source')}</p>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='image_id' label={t('Image ID/Asset ID')} icon='info' validations='maxLength:200' validationErrors={{
                  maxLength: t('Must be 200 characters or less.')
                }} length={200}
                dataPosition='top' dataTooltip={t('EarthEngine Image ID or Asset ID')}
                required
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput name='min' label={t('Min (Optional)')} icon='info' />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput name='max' label={t('Max (Optional)')} icon='info' />
            </Row>
          </div>
          <div className='right'>
            <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
