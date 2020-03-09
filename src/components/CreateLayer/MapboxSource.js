// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import { message, notification, Row, Col, Button } from 'antd'
import TextInput from '../forms/textInput'
import Radio from '../forms/radio'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'

type Props = {|
  onSubmit: Function
|}

type State = {
  canSubmit: boolean,
  selectedOption: string
} & LocaleStoreState & LayerStoreState;

export default class MapboxSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false,
    selectedOption: 'style'
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    addValidationRule('isValidMapboxStyleURL', (values, value) => {
      if (value) {
        return value.startsWith('mapbox://styles/')
      } else {
        return false
      }
    })

    addValidationRule('isValidMapboxMapID', (values, value) => {
      if (value) {
        const valArr = value.split('.')
        return valArr && Array.isArray(valArr) && valArr.length === 2
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
    if (model.mapboxStyleID) {
      const mapboxStyleID = model.mapboxStyleID.replace(/mapbox:\/\/styles\//i, '')
      dataSettings = {
        is_external: true,
        external_layer_type: 'mapbox-style',
        external_layer_config: {
          type: 'mapbox-style',
          mapboxid: mapboxStyleID
        }
      }
    } else if (model.mapboxMapID) {
      const mapboxMapID = model.mapboxMapID
      dataSettings = {
        is_external: true,
        external_layer_type: 'mapbox-map',
        external_layer_config: {
          url: 'mapbox://' + mapboxMapID,
          type: 'raster',
          tileSize: 256
        }
      }
    }
    LayerActions.saveDataSettings(dataSettings, _this.state._csrf, (err) => {
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

  optionChange = (value: string) => {
    this.setState({selectedOption: value})
  }

  render () {
    const {t} = this
    const mapboxOptions = [
      {value: 'style', label: t('Link to a complete Mapbox Studio Style')},
      {value: 'tiles', label: t('Link to Mapbox Data/Raster Tiles')}
    ]

    let styleOption = false
    let tilesOption = false
    switch (this.state.selectedOption) {
      case 'style':
        styleOption = true
        break
      case 'tiles':
        tilesOption = true
        break
      default:
        break
    }

    let styleForm = ''
    if (styleOption) {
      styleForm = (
        <div>
          <p>{t('Mapbox Style Source')}</p>
          <Row style={{marginBottom: '20px'}}>
            <TextInput
              name='mapboxStyleID' label={t('Mapbox Style URL')} icon='info' validations={{isValidMapboxStyleURL: true}} validationErrors={{
                isValidMapboxStyleURL: t('Invalid Mapbox Style URL, must be in the format mapbox://styles/...')
              }} length={100}
              dataPosition='top' dataTooltip={t('Mapbox Style URL in the format mapbox://styles/...')}
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
          <p>{t('Mapbox Tileset/Raster Source')}</p>
          <Row style={{marginBottom: '20px'}}>
            <TextInput
              name='mapboxMapID' label={t('Mapbox Tileset Map ID')} icon='info'
              validations={{isValidMapboxMapID: true}} validationErrors={{
                isValidMapboxMapID: t('Invalid Mapbox Map ID, should be in the format accountname.mapid')
              }} length={100}
              dataPosition='top' dataTooltip={t('Mapbox Map ID')}
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
            <Col span={20}>
              <Radio
                name='type' label=''
                defaultValue={this.state.selectedOption}
                options={mapboxOptions} onChange={this.optionChange}
              />
            </Col>
          </Row>
          <hr />
        </Formsy>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          {styleForm}
          {tilesForm}
          <div className='right'>
            <Button type='primary' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
