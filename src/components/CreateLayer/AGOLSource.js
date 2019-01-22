// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import TextInput from '../forms/textInput'
import Radio from '../forms/radio'
import LayerActions from '../../actions/LayerActions'
import NotificationActions from '../../actions/NotificationActions'
import MessageActions from '../../actions/MessageActions'
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
  }

  componentWillMount () {
    super.componentWillMount()
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
        MessageActions.showMessage({title: t('Error'), message: err})
      } else {
        NotificationActions.showNotification({
          message: t('Layer Saved'),
          dismissAfter: 1000,
          onDismiss () {
            // reset style to load correct source
            LayerActions.resetStyle()
            // tell the map that the data is initialized
            LayerActions.tileServiceInitialized()
            _this.props.onSubmit()
          }
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
          <div className='row'>
            <TextInput
              name='mapServiceUrl' label={t('Map Service URL')} icon='info' className='col s12' validations='maxLength:250,isHttps' validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t('SSL required for external links, URLs must start with https://')
              }} length={250}
              dataPosition='top' dataTooltip={t('Map Service URL: ex: http://myserver/arcgis/rest/services/MyMap/MapServer/0')}
              required />
          </div>
        </div>
      )
    }

    let fsqForm = ''
    if (fsqOption) {
      fsqForm = (
        <div>
          <p>{t('ArcGIS FeatureService Query Source')}</p>
          <div className='row'>
            <TextInput
              name='featureServiceUrl' label={t('Feature Service URL')} icon='info' className='col s12' validations='maxLength:250,isHttps' validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t('SSL required for external links, URLs must start with https://')
              }} length={250}
              dataPosition='top' dataTooltip={t('Feature Service URL ex: http://myserver/arcgis/rest/services/MyMap/FeatureServer/0')}
              required />
          </div>
        </div>
      )
    }

    let tilesForm = ''
    if (tilesOption) {
      tilesForm = (
        <div>
          <p>{t('ArcGIS MapServer Tiles')}</p>
          <div className='row'>
            <TextInput
              name='tileServiceUrl' label={t('MapServer Service URL')} icon='info' className='col s12' validations='maxLength:250,isHttps' validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t('SSL required for external links, URLs must start with https://')
              }} length={250}
              dataPosition='top' dataTooltip={t('MapServer URL ex: http://myserver/arcgis/rest/services/MyMap/MapServer')}
              required />
          </div>
        </div>
      )
    }

    return (
      <div className='row'>
        <Formsy>
          <b>{t('Choose an Option')}</b>
          <div className='row'>
            <Radio name='type' label=''
              defaultValue={this.state.selectedOption}
              options={agolOptions} onChange={this.optionChange}
              className='col s10'
            />
          </div>
          <hr />
        </Formsy>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          {msqForm}
          {fsqForm}
          {tilesForm}
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
          </div>
        </Formsy>
      </div>
    )
  }
}
