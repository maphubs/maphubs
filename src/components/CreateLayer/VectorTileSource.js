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

type Props = {|
    onSubmit: Function
  |}

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

    const boundsArr = model.bounds.split(',')
    boundsArr.map((item) => {
      return item.trim()
    })

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Vector Tile Service',
      external_layer_config: {
        type: 'vector',
        minzoom: model.minzoom,
        maxzoom: model.maxzoom,
        bounds: boundsArr,
        tiles: [model.vectorTileUrl]
      }
    }, _this.state._csrf, (err) => {
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

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  render () {
    const {t} = this
    return (
      <div className='row'>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>{t('Vector Tile Source')}</p>
            <div className='row'>
              <TextInput
                name='vectorTileUrl'
                label={t('Vector Tile URL')}
                icon='info'
                className='col s12'
                validations='maxLength:500,isHttps' validationErrors={{
                  maxLength: t('Must be 500 characters or less.'),
                  isHttps: t('SSL required for external links, URLs must start with https://')
                }}
                length={500}
                dataPosition='top'
                dataTooltip={t('Vector Tile URL for example:') + 'http://myserver/tiles/{z}/{x}/{y}.pbf'}
                required
              />
            </div>
            <div className='row'>
              <TextInput name='minzoom' label={t('MinZoom')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={t('Lowest tile zoom level available in data')}
                required />
            </div>
            <div className='row'>
              <TextInput name='maxzoom' label={t('MaxZoom')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={t('Highest tile zoom level available in data')}
                required />
            </div>
            <div className='row'>
              <TextInput name='bounds' label={t('Bounds')} icon='info' className='col s12'
                dataPosition='top' dataTooltip={t('Comma delimited WGS84 coordinates for extent of the data: minx, miny, maxx, maxy')}
                required />
            </div>
          </div>
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
          </div>
        </Formsy>
      </div>
    )
  }
}
