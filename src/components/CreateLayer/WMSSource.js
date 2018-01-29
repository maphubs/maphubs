// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import TextInput from '../forms/textInput'
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
    const _this = this
    let boundsArr
    if (model.bounds) {
      boundsArr = model.bounds.split(',')
      boundsArr = boundsArr.map((item) => {
        return item.trim()
      })
    }

    // Example WMS URL
    // 'https://geodata.state.nj.us/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=Natural2015'

    const urlParts = model.rasterTileUrl.split('?')
    let baseUrl
    let layers
    let url
    if (urlParts && urlParts.length > 0) {
      baseUrl = urlParts[0]
      if (!model.layers && urlParts.length === 2) {
        const queryParts = urlParts[1].split('&')
        queryParts.forEach((part) => {
          const keyVal = part.split('=')
          if (keyVal[0] === 'layers') {
            layers = keyVal[1]
          }
        })
      }
      url = `${baseUrl}?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=${layers}`
      if (model.other) {
        url += `?${model.other}`
      }
  
      LayerActions.saveDataSettings({
        is_external: true,
        external_layer_type: 'WMS',
        external_layer_config: {
          type: 'raster',
          minzoom: model.minzoom,
          maxzoom: model.maxzoom,
          bounds: boundsArr,
          tiles: [url]
        }
      }, _this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: _this.__('Error'), message: err})
        } else {
          NotificationActions.showNotification({
            message: _this.__('Layer Saved'),
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
    } else {
      MessageActions.showMessage({title: _this.__('Error'), message: 'WMS missing required "layers" value'})
    }
  }

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  render () {
    return (
      <div className='row'>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>Raster Tile Source</p>
            <div className='row'>
              <TextInput
                name='rasterTileUrl' label={this.__('WMS URL')} icon='info' className='col s12' validations='maxLength:500,isHttps' validationErrors={{
                  maxLength: this.__('Must be 500 characters or less.'),
                  isHttps: this.__('SSL required for external links, URLs must start with https://')
                }} length={500}
                dataPosition='top' dataTooltip={this.__('Only layers paramater is required, others will be ignored unless pasted in Other Parameters below. Example:') + 'https://geodata.state.nj.us/imagerywms/Natural2015?layers=Natural2015'}
                required />
            </div>
            <div className='row'>
              <TextInput name='other' label={this.__('Other Parameters (Optional)')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={this.__('Additional needed URL parmeters, for example: apikey=1234&query=value>0')}
              />
            </div>
            <div className='row'>
              <TextInput name='minzoom' label={this.__('MinZoom (Optional)')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={this.__('Lowest tile zoom level available in data')}
              />
            </div>
            <div className='row'>
              <TextInput name='maxzoom' label={this.__('MaxZoom (Optional)')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={this.__('Highest tile zoom level available in data')}
              />
            </div>
            <div className='row'>
              <TextInput name='bounds' label={this.__('Bounds (Optional)')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={this.__('Comma delimited WGS84 coordinates for extent of the data: minx, miny, maxx, maxy')}
              />
            </div>
          </div>
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{this.__('Save and Continue')}</button>
          </div>
        </Formsy>
      </div>
    )
  }
}
