// @flow
import type {Node} from "React";import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import LinkIcon from '@material-ui/icons/Link'
import TextInput from '../forms/textInput'
import LayerActions from '../../actions/LayerActions'
import Radio from '../forms/radio'
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
} & LocaleStoreState & LayerStoreState

export default class GeoJSONUrlSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    addValidationRule('isHttps', (values, value) => {
      if (value) {
        return value.startsWith('https://')
      } else {
        return false
      }
    })
  }

  enableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
  }

  submit: any | ((model: any) => void) = (model: Object) => {
    const {t} = this
    const _this = this

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'GeoJSON',
      external_layer_config: {
        type: 'geojson',
        id: model.id,
        data_type: model.data_type,
        data: model.geojsonUrl
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
          // reset style to load correct source
          LayerActions.resetStyle()
          // tell the map that the data is initialized
          LayerActions.tileServiceInitialized()
          _this.props.onSubmit()
        })
      }
    })
  }

  sourceChange: any | ((value: string) => void) = (value: string) => {
    this.setState({selectedSource: value})
  }

  render (): Node {
    const {t} = this
    const dataTypeOptions = [
      {value: 'point', label: t('Point')},
      {value: 'line', label: t('Line')},
      {value: 'polygon', label: t('Polygon')}
    ]

    return (
      <Row style={{marginBottom: '20px'}}>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton} style={{width: '100%'}}>

          <div>
            <p>{t('GeoJSON URL')}</p>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='geojsonUrl' label={t('GeoJSON URL')}
                icon={<LinkIcon />} validations='maxLength:500,isHttps'
                validationErrors={{
                  maxLength: t('Must be 500 characters or less.'),
                  isHttps: t('SSL required for external links, URLs must start with https://')
                }} length={500}
                tooltipPosition='top' tooltip={t('Vector Tile URL for example:') + 'http://myserver/tiles/{z}/{x}/{y}.pbf'}
                required
                t={t}
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='id' label={t('ID Property (Optional)')}
                tooltipPosition='top' tooltip={t('Some features require idenify a unique identifier that can be used to select features')}
                t={t}
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <Radio
                name='data_type' label=''
                defaultValue='point'
                options={dataTypeOptions}
              />
            </Row>
          </div>
          <div style={{float: 'right'}}>
            <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{t('Save and Continue')}</Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
