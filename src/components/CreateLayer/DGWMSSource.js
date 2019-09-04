// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import { Row, message, notification } from 'antd'
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

export default class WMSSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false
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

    const layers = 'DigitalGlobe:Imagery'
    let url = `https://services.digitalglobe.com/mapservice/wmsaccess?bbox={bbox-epsg-3857}&format=image/png&transparent=true&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=512&height=512&layers=${layers}&connectid={DG_WMS_CONNECT_ID}&COVERAGE_CQL_FILTER=legacyId='${model.featureid.trim()}'`

    if (model.username) {
      url += `&username=${model.username}&password=${model.password}`
    }

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'DGWMS',
      external_layer_config: {
        type: 'raster',
        minzoom: model.minzoom,
        maxzoom: model.maxzoom,
        bounds: undefined,
        tileSize: 512,
        tiles: [url]
        // authUrl: 'https://services.digitalglobe.com',
        // authToken: window.btoa(`${model.username}:${model.password}`)
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

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  render () {
    const {t} = this
    return (
      <Row>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>DigitalGlobe <a href='https://discover.digitalglobe.com/' target='_blank' rel='noopener noreferrer'>https://discover.digitalglobe.com/</a></p>
            <Row>
              <TextInput
                name='featureid' label={t('DG Image ID')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={t('DigitalGlobe Image ID / Legacy ID')}
                required
              />
            </Row>
          </div>
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
