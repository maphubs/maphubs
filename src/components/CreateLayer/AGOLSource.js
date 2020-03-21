// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import TextInput from '../forms/textInput'
import Radio from '../forms/radio'
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
  selectedOption: string
} & LocaleStoreState & LayerStoreState

export default class AGOLSource extends MapHubsComponent<Props, State> {
  state: State = {
    canSubmit: false,
    selectedOption: 'mapserverquery'
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
    let dataSettings = null
    if (model.mapServiceUrl) {
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS MapServer Query',
        external_layer_config: {
          type: 'ags-mapserver-query',
          url: model.mapServiceUrl
        }
      }
    } else if (model.featureServiceUrl) {
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS FeatureServer Query',
        external_layer_config: {
          type: 'ags-featureserver-query',
          url: model.featureServiceUrl
        }
      }
    } else if (model.tileServiceUrl) {
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS MapServer Tiles',
        external_layer_config: {
          type: 'ags-mapserver-tiles',
          url: model.tileServiceUrl
        }
      }
    }
    LayerActions.saveDataSettings(dataSettings, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
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

  optionChange = (value: string) => {
    this.setState({selectedOption: value})
  }

  render () {
    const {t} = this
    const agolOptions = [
      {value: 'mapserverquery', label: t('Link to a MapServer Query Service')},
      {value: 'featureserverquery', label: t('Link to a FeatureServer Query Service')},
      {value: 'mapservertiles', label: t('Link to a MapServer Tile Service')}
    ]

    let msqOption = false
    let fsqOption = false
    let tilesOption = false
    switch (this.state.selectedOption) {
      case 'mapserverquery':
        msqOption = true
        break
      case 'featureserverquery':
        fsqOption = true
        break
      case 'mapservertiles':
        tilesOption = true
        break
      default:
        break
    }

    let msqForm = ''
    if (msqOption) {
      msqForm = (
        <div>
          <p>{t('ArcGIS MapServer Query Source')}</p>
          <Row style={{marginBottom: '20px'}}>
            <TextInput
              name='mapServiceUrl' label={t('Map Service URL')} icon='info' validations='maxLength:250,isHttps' validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t('SSL required for external links, URLs must start with https://')
              }} length={250}
              tooltipPosition='top' tooltip={t('Map Service URL: ex: http://myserver/arcgis/rest/services/MyMap/MapServer/0')}
              required
            />
          </Row>
        </div>
      )
    }

    let fsqForm = ''
    if (fsqOption) {
      fsqForm = (
        <div>
          <p>{t('ArcGIS FeatureService Query Source')}</p>
          <Row style={{marginBottom: '20px'}}>
            <TextInput
              name='featureServiceUrl' label={t('Feature Service URL')} icon='info' validations='maxLength:250,isHttps' validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t('SSL required for external links, URLs must start with https://')
              }} length={250}
              tooltipPosition='top' tooltip={t('Feature Service URL ex: http://myserver/arcgis/rest/services/MyMap/FeatureServer/0')}
              required
            />
          </Row>
        </div>
      )
    }

    let tilesForm = ''
    if (tilesOption) {
      tilesForm = (
        <div>
          <p>{t('ArcGIS MapServer Tiles')}</p>
          <Row style={{marginBottom: '20px'}}>
            <TextInput
              name='tileServiceUrl' label={t('MapServer Service URL')} icon='info' validations='maxLength:250,isHttps' validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t('SSL required for external links, URLs must start with https://')
              }} length={250}
              tooltipPosition='top' tooltip={t('MapServer URL ex: http://myserver/arcgis/rest/services/MyMap/MapServer')}
              required
            />
          </Row>
        </div>
      )
    }

    return (
      <Row style={{marginBottom: '20px'}}>
        <Formsy>
          <b>{t('Choose an Option')}</b>
          <Row style={{marginBottom: '20px'}}>
            <Radio
              name='type' label=''
              defaultValue={this.state.selectedOption}
              options={agolOptions} onChange={this.optionChange}
            />
          </Row>
          <hr />
        </Formsy>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          {msqForm}
          {fsqForm}
          {tilesForm}
          <div style={{float: 'right'}}>
            <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
