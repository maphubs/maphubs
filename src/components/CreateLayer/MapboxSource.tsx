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

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
    addValidationRule('isValidMapboxStyleURL', (values, value?: string) => {
      return value ? value.startsWith('mapbox://styles/') : false
    })
    addValidationRule('isValidMapboxMapID', (values, value?: string) => {
      if (value) {
        const valArr = value.split('.')
        return valArr.length === 2
      } else {
        return false
      }
    })
  }

  enableButton = (): void => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = (): void => {
    this.setState({
      canSubmit: false
    })
  }
  submit = (model: Record<string, any>): void => {
    const { t, props, state } = this
    const { _csrf } = state
    const { onSubmit } = props

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

    LayerActions.saveDataSettings(dataSettings, _csrf, (err) => {
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

          onSubmit()
        })
      }
    })
  }
  optionChange = (value: string): void => {
    this.setState({
      selectedOption: value
    })
  }

  render(): JSX.Element {
    const { t, state, optionChange, submit, enableButton, disableButton } = this
    const { selectedOption, canSubmit } = state
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
                  defaultValue={selectedOption}
                  options={mapboxOptions}
                  onChange={optionChange}
                />
              </Col>
            </Row>
          </Formsy>
        </Col>
        <Col span={12}>
          <Formsy
            onValidSubmit={submit}
            onValid={enableButton}
            onInvalid={disableButton}
          >
            {selectedOption === 'style' && (
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
                    tooltip={t(
                      'Mapbox Style URL in the format mapbox://styles/...'
                    )}
                    required
                    t={t}
                  />
                </Row>
              </div>
            )}
            {selectedOption === 'tiles' && (
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
            )}
            <div
              style={{
                float: 'right'
              }}
            >
              <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                {t('Save and Continue')}
              </Button>
            </div>
          </Formsy>
        </Col>
      </Row>
    )
  }
}
