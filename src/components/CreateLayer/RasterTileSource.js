// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import TextInput from '../forms/textInput'
import { Row, message, notification } from 'antd'
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

export default class RasterTileSource extends MapHubsComponent<Props, State> {
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
    let boundsArr
    if (model.bounds) {
      boundsArr = model.bounds.split(',')
      boundsArr = boundsArr.map((item) => {
        return item.trim()
      })
    }

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Raster Tile Service',
      external_layer_config: {
        type: 'raster',
        minzoom: parseInt(model.minzoom, 10),
        maxzoom: parseInt(model.maxzoom, 10),
        bounds: boundsArr,
        tiles: [model.rasterTileUrl]
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
      <Row style={{marginBottom: '20px'}}>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>{t('Raster Tile Source')}</p>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='rasterTileUrl' label={t('Raster Tile URL')} icon='info' validations='maxLength:500,isHttps' validationErrors={{
                  maxLength: t('Must be 500 characters or less.'),
                  isHttps: t('SSL required for external links, URLs must start with https://')
                }} length={500}
                dataPosition='top' dataTooltip={t('Raster URL for example:') + 'http://myserver/tiles/{z}/{x}/{y}.png'}
                required
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='minzoom' label={t('MinZoom (Optional)')} icon='info'
                dataPosition='top' dataTooltip={t('Lowest tile zoom level available in data')}
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='maxzoom' label={t('MaxZoom (Optional)')} icon='info'
                dataPosition='top' dataTooltip={t('Highest tile zoom level available in data')}
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='bounds' label={t('Bounds (Optional)')} icon='info'
                dataPosition='top' dataTooltip={t('Comma delimited WGS84 coordinates for extent of the data: minx, miny, maxx, maxy')}
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
