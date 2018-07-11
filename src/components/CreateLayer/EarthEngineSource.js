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
                name='image_id' label={this.__('Image ID/Asset ID')} icon='info' className='col s12' validations='maxLength:200' validationErrors={{
                  maxLength: this.__('Must be 200 characters or less.')
                }} length={200}
                dataPosition='top' dataTooltip={this.__('EarthEngine Image ID or Asset ID')}
                required />
            </div>
            <div className='row'>
              <TextInput name='min' label={this.__('Min (Optional)')} icon='info' className='col s12' />
            </div>
            <div className='row'>
              <TextInput name='max' label={this.__('Max (Optional)')} icon='info' className='col s12' />
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
