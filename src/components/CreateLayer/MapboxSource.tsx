import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { message, notification, Row, Col, Button } from 'antd'
import TextInput from '../forms/textInput'
import Radio from '../forms/radio'
import useT from '../../hooks/useT'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'

const MapboxSource = ({ onSubmit }: { onSubmit: () => void }): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)

  const [canSubmit, setCanSubmit] = useState(false)
  const [selectedOption, setSelectedOption] = useState('style')

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

  const submit = async (model: Record<string, any>): Promise<void> => {
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

    try {
      await LayerAPI.saveDataSettings(layer_id, dataSettings)
      message.success(t('Layer Saved'), 1, () => {
        // save in store
        dispatch(saveDataSettings(dataSettings))
        // reset style to load correct source
        dispatch(resetStyle())
        // tell the map that the data is initialized
        dispatch(tileServiceInitialized())

        onSubmit()
      })
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

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
                onChange={setSelectedOption}
              />
            </Col>
          </Row>
        </Formsy>
      </Col>
      <Col span={12}>
        <Formsy
          onValidSubmit={submit}
          onValid={() => {
            setCanSubmit(true)
          }}
          onInvalid={() => {
            setCanSubmit(false)
          }}
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
export default MapboxSource
