import React from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { message, notification, Row, Col, Button } from 'antd'
import TextInput from '../forms/textInput'
import Radio from '../forms/radio'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
type Props = {
  onSubmit: (...args: Array<any>) => any
}
type State = {
  canSubmit: boolean
  selectedOption: string
} & LocaleStoreState &
  LayerStoreState
export default class MapboxSource extends React.Component<Props, State> {
  props: Props
  state: State = {
    canSubmit: false,
    selectedOption: 'style'
  }

  constructor(props: Props) {
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
  submit: any | ((model: any) => void) = (model: Record<string, any>) => {
    const { t } = this

    const _this = this

    let dataSettings

    if (model.mapboxStyleID) {
      const mapboxStyleID = model.mapboxStyleID.replace(
        /mapbox:\/\/styles\//i,
        ''
      )
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
  optionChange: any | ((value: string) => void) = (value: string) => {
    this.setState({
      selectedOption: value
    })
  }

  render(): JSX.Element {
    const { t } = this
    const mapboxOptions = [
      {
        value: 'style',
        label: t('Link to a complete Mapbox Studio Style')
      },
      {
        value: 'tiles',
        label: t('Link to Mapbox Data/Raster Tiles')
      }
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
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='mapboxStyleID'
              label={t('Mapbox Style URL')}
              validations={{
                isValidMapboxStyleURL: true
              }}
              validationErrors={{
                isValidMapboxStyleURL: t(
                  'Invalid Mapbox Style URL, must be in the format mapbox://styles/...'
                )
              }}
              length={100}
              tooltipPosition='top'
              tooltip={t('Mapbox Style URL in the format mapbox://styles/...')}
              required
              t={t}
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
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='mapboxMapID'
              label={t('Mapbox Tileset Map ID')}
              validations={{
                isValidMapboxMapID: true
              }}
              validationErrors={{
                isValidMapboxMapID: t(
                  'Invalid Mapbox Map ID, should be in the format accountname.mapid'
                )
              }}
              length={100}
              tooltipPosition='top'
              tooltip={t('Mapbox Map ID')}
              required
              t={t}
            />
          </Row>
        </div>
      )
    }

    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Col span={12}>
          <Formsy>
            <b>{t('Choose an Option')}</b>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Col span={20}>
                <Radio
                  name='type'
                  label=''
                  defaultValue={this.state.selectedOption}
                  options={mapboxOptions}
                  onChange={this.optionChange}
                />
              </Col>
            </Row>
          </Formsy>
        </Col>
        <Col span={12}>
          <Formsy
            onValidSubmit={this.submit}
            onValid={this.enableButton}
            onInvalid={this.disableButton}
          >
            {styleForm}
            {tilesForm}
            <div
              style={{
                float: 'right'
              }}
            >
              <Button
                type='primary'
                htmlType='submit'
                disabled={!this.state.canSubmit}
              >
                {t('Save and Continue')}
              </Button>
            </div>
          </Formsy>
        </Col>
      </Row>
    )
  }
}
