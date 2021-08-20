import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Col, message, notification, Button } from 'antd'
import LinkIcon from '@material-ui/icons/Link'
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

const AGOLSource = ({ onSubmit }: { onSubmit: () => void }): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const [canSubmit, setCanSubmit] = useState(false)
  const [selectedOption, setSelectedOption] = useState('mapserverquery')

  const layer_id = useSelector((state) => state.layer.layer_id)

  addValidationRule('isHttps', (values, value: string) => {
    return value ? value.startsWith('https://') : false
  })

  const submit = async (model: Record<string, any>): Promise<void> => {
    let dataSettings

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
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }

  const agolOptions = [
    {
      value: 'mapserverquery',
      label: t('Link to a MapServer Query Service')
    },
    {
      value: 'featureserverquery',
      label: t('Link to a FeatureServer Query Service')
    }
  ]
  let msqOption = false
  let fsqOption = false

  switch (selectedOption) {
    case 'mapserverquery':
      msqOption = true
      break

    case 'featureserverquery':
      fsqOption = true
      break

    default:
      break
  }

  let msqForm = <></>

  if (msqOption) {
    msqForm = (
      <div>
        <p>{t('ArcGIS MapServer Query Source')}</p>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <TextInput
            name='mapServiceUrl'
            label={t('Map Service URL')}
            icon={<LinkIcon />}
            validations='maxLength:250,isHttps'
            validationErrors={{
              maxLength: t('Must be 250 characters or less.'),
              isHttps: t(
                'SSL required for external links, URLs must start with https://'
              )
            }}
            length={250}
            tooltipPosition='top'
            tooltip={t(
              'Map Service URL: ex: http://myserver/arcgis/rest/services/MyMap/MapServer/0'
            )}
            required
            t={t}
          />
        </Row>
      </div>
    )
  }

  let fsqForm = <></>

  if (fsqOption) {
    fsqForm = (
      <div>
        <p>{t('ArcGIS FeatureService Query Source')}</p>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <TextInput
            name='featureServiceUrl'
            label={t('Feature Service URL')}
            icon={<LinkIcon />}
            validations='maxLength:250,isHttps'
            validationErrors={{
              maxLength: t('Must be 250 characters or less.'),
              isHttps: t(
                'SSL required for external links, URLs must start with https://'
              )
            }}
            length={250}
            tooltipPosition='top'
            tooltip={t(
              'Feature Service URL ex: http://myserver/arcgis/rest/services/MyMap/FeatureServer/0'
            )}
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
            <Radio
              name='type'
              label=''
              defaultValue={selectedOption}
              options={agolOptions}
              onChange={setSelectedOption}
            />
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
          {msqForm}
          {fsqForm}
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
export default AGOLSource
